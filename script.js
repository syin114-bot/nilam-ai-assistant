// NILAM AI Assistant 2.0


let currentData = {};




// SEARCH

async function searchBook(){


const input =
document.getElementById("searchInput")
.value.trim();



if(!input){

alert("Please enter book title");
return;

}



document
.getElementById("result")
.classList.remove("hidden");



document.getElementById("nilamData")
.innerHTML =
`
<div class="loading">
🔎 Searching book...
</div>
`;



try{


let url =
"https://www.googleapis.com/books/v1/volumes?q="
+
encodeURIComponent(input)
+
"&maxResults=10";



let response =
await fetch(url);



let data =
await response.json();



if(data.items){


let chosen =
chooseBook(
data.items,
input
);


if(chosen){

await generateNilam(
chosen.volumeInfo
);

return;

}

}





let openURL =
"https://openlibrary.org/search.json?q="
+
encodeURIComponent(input);



let openResponse =
await fetch(openURL);


let openData =
await openResponse.json();



if(openData.docs.length){


await generateOpenLibrary(
openData.docs[0]
);


return;

}



throw Error();



}

catch(e){


document.getElementById("nilamData")
.innerHTML=
`
<p>
❌ 找不到资料
</p>
`;

}


}





function chooseBook(items,input){


let key =
input.toLowerCase();



return items.find(item=>{


let title =
item.volumeInfo.title?
item.volumeInfo.title.toLowerCase():
"";


return title.includes(key)
||
key.includes(title);


})
||
items[0];


}





// NILAM GENERATE


async function generateNilam(book){



let title =
book.title || "Unknown";



currentData={


"Tarikh":
new Date().toLocaleDateString("en-GB"),


"Tajuk":
title,


"Jenis buku":
"Buku Fiksyen",


"Kategori":
"Umum",


"Bilangan mukasurat":
book.pageCount || "AI mencari...",


"ISBN":
getISBN(book.industryIdentifiers),


"Penulis":
book.authors?
book.authors.join(", "):
"Unknown",


"Penerbit":
book.publisher || "AI mencari...",


"Tahun Terbitan":
book.publishedDate?
book.publishedDate.substring(0,4):
"Unknown",


"Bahasa":
detectLanguage(title),


"Rumusan":
"AI generating...",


"Pengajaran":
"AI generating..."

};



showData();




let ai =
await getAI({

title:title,

author:currentData["Penulis"],

pages:currentData["Bilangan mukasurat"],

publisher:currentData["Penerbit"]

});




if(ai){


Object.assign(
currentData,
ai
);


showData();


}



}





// OPEN LIBRARY

async function generateOpenLibrary(book){


currentData={


"Tajuk":
book.title,


"Penulis":
book.author_name?
book.author_name.join(", "):
"Unknown",


"出版社":
book.publisher?
book.publisher[0]:
"Unknown",


"Bilangan mukasurat":
book.number_of_pages_median || "AI mencari...",


"Rumusan":
"AI generating...",


"Pengajaran":
"AI generating..."

};


showData();



let ai =
await getAI({

title:book.title,

author:
currentData["Penulis"]

});



if(ai){

Object.assign(
currentData,
ai
);

showData();

}


}





// AI CALL


async function getAI(info){


try{


let res =
await fetch(
"/api/ai",
{


method:"POST",


headers:{

"Content-Type":
"application/json"

},


body:
JSON.stringify(info)


});



return await res.json();


}
catch(e){


console.log(e);


return null;


}


}





// DISPLAY


function showData(){


let box =
document.getElementById("nilamData");



box.innerHTML="";



Object.entries(currentData)
.forEach(([k,v])=>{


box.innerHTML +=
`

<div class="nilam-item">


<div class="nilam-title">
${k}
</div>


<div>
${v}
</div>


</div>

`;



});


}





function copyAll(){


let text="";


for(let k in currentData){

text+=
k+
": "+
currentData[k]+
"\n\n";

}


navigator.clipboard.writeText(text);


alert("Copied!");

}





function detectLanguage(title){

return /[a-z]/i.test(title)
?
"English"
:
"Bahasa Melayu";

}





function getISBN(ids){

if(!ids)
return "Unknown";


return ids[0].identifier;

}

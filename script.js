// NILAM AI Assistant 2.0
// Google Books + Open Library + AI


let currentData = {};



// =======================
// SEARCH
// =======================


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



document.getElementById("nilamData").innerHTML =
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




// backup

let openURL =
"https://openlibrary.org/search.json?q="
+
encodeURIComponent(input);



let openResponse =
await fetch(openURL);



let openData =
await openResponse.json();



if(openData.docs.length){


generateOpenLibrary(
openData.docs[0]
);


return;

}



throw Error("Not found");



}

catch(error){


document.getElementById("nilamData").innerHTML =
`
<p>
❌ 找不到资料<br>
Try another title
</p>
`;

}


}





// =======================
// CHOOSE BOOK
// =======================


function chooseBook(items,input){


let key =
input.toLowerCase();



return items.find(item=>{


let title =
item.volumeInfo.title
?
item.volumeInfo.title.toLowerCase()
:
"";


return title.includes(key)
||
key.includes(title);


})
||
items[0];


}







// =======================
// CREATE NILAM
// =======================


async function generateNilam(book){


let title =
book.title || "Unknown";


let author =
book.authors
?
book.authors.join(", ")
:
"Unknown";


let publisher =
book.publisher || "Unknown";


let year =
book.publishedDate
?
book.publishedDate.substring(0,4)
:
"Unknown";


let pages =
book.pageCount || "Unknown";


let isbn =
getISBN(
book.industryIdentifiers
);



let language =
detectLanguage(title);



let type =
detectType(title);



let category =
detectCategory(title);





currentData = {


"Tarikh":
new Date().toLocaleDateString("en-GB"),


"Tajuk":
title,


"Jenis buku":
type,


"Kategori":
category,


"Bilangan mukasurat":
pages,


"ISBN":
isbn,


"Penulis":
author,


"Penerbit":
publisher,


"Tahun Terbitan":
year,


"Bahasa":
language,


"Rumusan":
"AI generating...",


"Pengajaran":
"AI generating..."


};



showData();




// AI

let ai =
await getAI({

title:title,

author:author,

pages:pages,

publisher:publisher

});




if(ai){


currentData["Rumusan"] =
ai.Rumusan ||
ai.rumusan ||
"AI failed";



currentData["Pengajaran"] =
ai.Pengajaran ||
ai.pengajaran ||
"AI failed";



currentData["Kategori"] =
ai.Kategori ||
ai.kategori ||
category;



currentData["Jenis buku"] =
ai["Jenis buku"] ||
ai["jenis buku"] ||
type;



currentData["Bahasa"] =
ai.Bahasa ||
ai.bahasa ||
language;



currentData["Bilangan mukasurat"] =
ai.Mukasurat ||
ai.mukasurat ||
pages;



currentData["Penerbit"] =
ai.Penerbit ||
ai.penerbit ||
publisher;



showData();


}



}








// =======================
// OPEN LIBRARY
// =======================


function generateOpenLibrary(book){


currentData = {


"Tarikh":
new Date().toLocaleDateString("en-GB"),


"Tajuk":
book.title || "Unknown",


"Jenis buku":
"Buku Fiksyen",


"Kategori":
"Umum",


"Bilangan mukasurat":
book.number_of_pages_median || "Unknown",


"ISBN":
book.isbn
?
book.isbn[0]
:
"Unknown",


"Penulis":
book.author_name
?
book.author_name.join(", ")
:
"Unknown",


"Penerbit":
book.publisher
?
book.publisher[0]
:
"Unknown",


"Tahun Terbitan":
book.first_publish_year || "Unknown",


"Bahasa":
"English",


"Rumusan":
"AI generating...",


"Pengajaran":
"AI generating..."


};



showData();



getAI({

title:book.title,

author:currentData["Penulis"],

pages:currentData["Bilangan mukasurat"],

publisher:currentData["Penerbit"]

})
.then(ai=>{


if(ai){


currentData["Rumusan"]=ai.Rumusan;

currentData["Pengajaran"]=ai.Pengajaran;


showData();


}


});


}









// =======================
// AI API
// =======================


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

catch(error){


console.log(error);


return null;


}


}









// =======================
// DISPLAY
// =======================


function showData(){


let box =
document.getElementById("nilamData");



box.innerHTML="";



Object.entries(currentData)
.forEach(([key,value])=>{


box.innerHTML +=
`

<div class="nilam-item">


<div class="nilam-title">

${key}

</div>


<div>

${value}

</div>



<button
class="copy-btn"
onclick="copyText('${value}')">

📋 Copy ${key}

</button>


</div>


`;



});



updateProgress();


}









// =======================
// COPY
// =======================


function copyText(text){


navigator.clipboard.writeText(text);


alert("Copied!");

}


function copyAll(){


let text="";


for(let key in currentData){


text +=
key+
":\n"+
currentData[key]
+
"\n\n";


}



navigator.clipboard.writeText(text);


alert("All NILAM copied!");

}









// =======================
// CLASSIFY
// =======================


function detectType(title){


let t =
title.toLowerCase();



if(
t.includes("science") ||
t.includes("history") ||
t.includes("guide")
)

return "Buku Bukan Fiksyen";



return "Buku Fiksyen";


}






function detectCategory(title){


let t =
title.toLowerCase();



if(
t.includes("harry") ||
t.includes("magic") ||
t.includes("dragon")
)

return "Fantasi";



if(
t.includes("success") ||
t.includes("habit")
)

return "Motivasi";



return "Umum";


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









// =======================
// PROGRESS
// =======================


function updateProgress(){


let count =
Number(
localStorage.getItem("bookCount")
||0
);



count++;



localStorage.setItem(
"bookCount",
count
);



let counter =
document.getElementById("bookCount");



let bar =
document.getElementById("progressBar");



if(counter)

counter.innerText=count;



if(bar)

bar.style.width =
Math.min(
count/720*100,
100
)
+
"%";


}

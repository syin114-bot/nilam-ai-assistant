let currentData = {};


// =================
// SEARCH BOOK
// =================

async function searchBook(){

const input =
document.getElementById("searchInput").value.trim();


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



let book;



if(data.items){


book =
chooseBook(
data.items,
input
)
.volumeInfo;


}



if(!book){

throw Error();

}



// 先显示资料

generateNilam(book);



}

catch(e){


document.getElementById("nilamData").innerHTML =
`
<p>
❌ 找不到资料
</p>
`;

}


}






// =================
// PICK BEST
// =================


function chooseBook(items,input){


let key =
input.toLowerCase();



return items.find(item=>{


let title =
(item.volumeInfo.title||"")
.toLowerCase();


return title.includes(key)
||
key.includes(title);


})
||
items[0];

}







// =================
// NILAM DATA
// =================


async function generateNilam(book){



let title =
book.title || "Unknown";


let category =
detectCategory(title);



currentData = {


"Tarikh":
new Date().toLocaleDateString("en-GB"),


"Tajuk":
title,


"Jenis buku":
detectType(title),


"Kategori":
category,


"Bilangan mukasurat":
book.pageCount
?
book.pageCount
:
"Sedang mencari...",


"ISBN":
getISBN(book.industryIdentifiers),


"Penulis":
book.authors
?
book.authors.join(", ")
:
"Unknown",


"Penerbit":
book.publisher
?
book.publisher
:
"Sedang mencari...",


"Tahun Terbitan":
book.publishedDate
?
book.publishedDate.substring(0,4)
:
"Unknown",


"Bahasa":
detectLanguage(title),


"Rumusan":
"AI generating...",


"Pengajaran":
"AI generating..."

};



showData();



// call AI

let ai =
await getAI(title);



if(ai){


currentData["Rumusan"]
=
ai.Rumusan;


currentData["Pengajaran"]
=
ai.Pengajaran;


if(
currentData["Kategori"]==="Umum"
)

currentData["Kategori"]
=
ai.Kategori;


if(
currentData["Jenis buku"]
)

currentData["Jenis buku"]
=
ai["Jenis buku"];


}



showData();


}








// =================
// AI API
// =================


async function getAI(title){


try{


let res =
await fetch("/api/ai",{


method:"POST",


headers:{
"Content-Type":"application/json"
},


body:JSON.stringify({

title:title

})


});



return await res.json();


}

catch(e){


return null;


}


}







// =================
// DISPLAY
// =================


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
onclick="copyText('${String(value).replaceAll("'","")}')">

📋 Copy ${key}

</button>


</div>

`;



});


}





function copyText(text){

navigator.clipboard.writeText(text);

alert("Copied!");

}







// =================
// CLASSIFY
// =================


function detectType(title){


let t =
title.toLowerCase();



if(
t.includes("habit")
||
t.includes("science")
||
t.includes("history")
)

return "Buku Bukan Fiksyen";



return "Buku Fiksyen";

}




function detectCategory(title){


let t =
title.toLowerCase();



if(
t.includes("harry")
||
t.includes("magic")
||
t.includes("dragon")
)

return "Fantasi";



if(
t.includes("habit")
||
t.includes("success")
)

return "Motivasi";



if(
t.includes("science")
)

return "Sains";


return "Umum";

}





function detectLanguage(title){


if(
/[a-z]/i.test(title)
)

return "English";


return "Bahasa Melayu";

}




function getISBN(ids){


if(!ids)
return "Unknown";


return ids[0].identifier;


}

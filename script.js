// NILAM AI Assistant 2.0
// Search Book -> Generate NILAM Format


let currentData = {};


// =====================
// Search Book
// =====================

async function searchBook(){


const input =
document.getElementById("searchInput").value;


if(!input){

alert("Please enter book title");
return;

}



const result =
document.getElementById("result");


result.classList.remove("hidden");


document.getElementById("nilamData").innerHTML =
`
<div class="loading">
<i class="fa-solid fa-spinner fa-spin"></i>
Searching book...
</div>
`;



try{


let url =
"https://www.googleapis.com/books/v1/volumes?q="
+
encodeURIComponent(input);



let response =
await fetch(url);


let data =
await response.json();



if(!data.items){

throw "Not found";

}



let book =
data.items[0].volumeInfo;



generateNilam(book);



}

catch(error){


document.getElementById("nilamData").innerHTML =
`
<p>
Book not found. Please enter manually.
</p>
`;

}



}





// =====================
// Generate NILAM
// =====================


function generateNilam(book){



let title =
book.title || "Unknown";


let author =
book.authors ?
book.authors.join(", ")
:
"Unknown";


let publisher =
book.publisher ||
"Unknown";


let year =
book.publishedDate ?
book.publishedDate.substring(0,4)
:
"Unknown";


let pages =
book.pageCount ||
"Unknown";


let isbn =
getISBN(book.industryIdentifiers);



let language =
detectLanguage(title,book.description);



let type =
detectType(book.categories);



let category =
detectCategory(book.categories);



let summary =
createSummary(title,type,category);



let lesson =
createLesson(category);



currentData={

Tarikh:
new Date().toLocaleDateString("en-GB"),

Tajuk:title,

"Jenis buku":
type,

Kategori:
category,

"Bilangan mukasurat":
pages,

ISBN:isbn,

Penulis:
author,

Penerbit:
publisher,

"Tahun Terbitan":
year,

Bahasa:
language,

Rumusan:
summary,

Pengajaran:
lesson

};



showData();



}



// =====================
// Display
// =====================


function showData(){


let box =
document.getElementById("nilamData");


box.innerHTML="";



Object.entries(currentData)
.forEach(([key,value])=>{


box.innerHTML += `


<div class="nilam-item">


<div class="nilam-title">

${key}

</div>


<div>

${value}

</div>



<button

class="copy-btn"

onclick="copyText('${escapeText(value)}')">

📋 Copy ${key}

</button>


</div>


`;



});



updateProgress();


}




// =====================
// Copy
// =====================


function copyText(text){


navigator.clipboard.writeText(text);


alert("Copied!");

}




function copyAll(){


let text="";


Object.entries(currentData)
.forEach(([k,v])=>{


text +=

k+
":\n"+
v+
"\n\n";


});



navigator.clipboard.writeText(text);


alert("All NILAM copied!");

}



// =====================
// Helpers
// =====================


function getISBN(ids){


if(!ids)return "Unknown";


return ids[0].identifier;

}




function detectType(cat){


if(!cat)return "Buku Fiksyen";


let c =
cat.join(" ").toLowerCase();



if(
c.includes("science") ||
c.includes("business") ||
c.includes("self")
)

return "Buku Bukan Fiksyen";



return "Buku Fiksyen";

}





function detectCategory(cat){


if(!cat)
return "Umum";


let c =
cat.join(" ").toLowerCase();



if(c.includes("fantasy"))
return "Fantasi";


if(c.includes("romance"))
return "Romantik";


if(c.includes("science"))
return "Sains";


if(c.includes("biography"))
return "Biografi";


return "Umum";

}





function detectLanguage(title,desc){


let text =
(title+" "+(desc||""))
.toLowerCase();



if(
text.includes("malay") ||
text.includes("bahasa")
)

return "Bahasa Melayu";



return "English";

}





function createSummary(
title,
type,
category
){


return (

title+
" ialah sebuah buku "+
type+
" kategori "+
category+
" yang menceritakan tentang perkembangan cerita, pengalaman dan nilai kehidupan."

);

}





function createLesson(category){


if(category==="Fantasi")

return "Kita perlu berani, setia dan menghargai persahabatan.";


if(category==="Sains")

return "Kita perlu rajin belajar dan mencari ilmu pengetahuan.";


return "Buku ini mengajar nilai disiplin, usaha dan tanggungjawab.";

}





function escapeText(text){

return text
.replace(/'/g,"\\'");

}




// =====================
// Progress
// =====================


function updateProgress(){


let count =
parseInt(localStorage.getItem("bookCount")||0);



count++;


localStorage.setItem(
"bookCount",
count
);



document.getElementById("bookCount")
.innerText=count;



document.getElementById("progressBar")
.style.width =
Math.min(count/720*100,100)
+"%";


}

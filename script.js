let currentData = {};

async function searchBook(){

const input =
document.getElementById("searchInput").value.trim();


if(!input){
alert("Enter book title");
return;
}


document.getElementById("result")
.classList.remove("hidden");


document.getElementById("nilamData").innerHTML =
"🔎 Searching...";


try{


let url =
"https://www.googleapis.com/books/v1/volumes?q="
+
encodeURIComponent(input)
+
"&maxResults=10";



let res =
await fetch(url);


let data =
await res.json();



if(!data.items){

throw Error();

}



let book =
data.items[0].volumeInfo;



generateNilam(book);



}

catch(e){


document.getElementById("nilamData").innerHTML =
`
❌ Book not found
`;

}


}





function generateNilam(book){


let title =
book.title || "Unknown";


let category =
detectCategory(title);



currentData={


"Tarikh":
new Date().toLocaleDateString("en-GB"),


"Tajuk":
title,


"Jenis buku":
category==="Motivasi"
?
"Buku Bukan Fiksyen"
:
"Buku Fiksyen",


"Kategori":
category,


"Bilangan mukasurat":
book.pageCount || "Unknown",


"ISBN":
book.industryIdentifiers
?
book.industryIdentifiers[0].identifier
:
"Unknown",


"Penulis":
book.authors
?
book.authors.join(", ")
:
"Unknown",


"Penerbit":
book.publisher || "Unknown",


"Tahun Terbitan":
book.publishedDate
?
book.publishedDate.substring(0,4)
:
"Unknown",


"Bahasa":
"English",


"Rumusan":
makeSummary(title,category),


"Pengajaran":
makeLesson(category)



};



showData();


}





function showData(){


let box =
document.getElementById("nilamData");


box.innerHTML="";



Object.entries(currentData)
.forEach(([key,value])=>{


box.innerHTML +=
`

<div class="nilam-item">

<h3>${key}</h3>

<p>${value}</p>

<button onclick="copyText('${value}')">
📋 Copy ${key}
</button>


</div>


`;


});


}





function copyText(text){

navigator.clipboard.writeText(text);

alert("Copied");

}





function detectCategory(title){


let t =
title.toLowerCase();



if(
t.includes("harry")
||
t.includes("magic")
||
t.includes("fantasy")
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





function makeSummary(title,cat){


if(cat==="Fantasi")

return "Buku ini mengisahkan pengembaraan watak utama yang menghadapi cabaran serta belajar tentang keberanian dan persahabatan.";


if(cat==="Motivasi")

return "Buku ini menerangkan cara membina tabiat baik dan memperbaiki kehidupan melalui perubahan kecil.";


return "Buku ini menceritakan pengalaman watak utama serta membawa nilai kehidupan kepada pembaca.";


}




function makeLesson(cat){


if(cat==="Fantasi")

return "Kita perlu berani menghadapi cabaran dan menghargai persahabatan.";


if(cat==="Motivasi")

return "Kita perlu berusaha, berdisiplin dan tidak mudah berputus asa.";


return "Kita perlu bertanggungjawab dan menghormati orang lain.";


}

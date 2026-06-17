// NILAM AI Assistant 2.0
// Google Books + Open Library Backup


let currentData = {};



// =======================
// Search
// =======================


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


// Google Books

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
chooseBook(data.items,input);



if(chosen){


generateNilam(
chosen.volumeInfo
);


return;

}


}



// Backup Open Library

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




throw Error("not found");



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
// Pick best book
// =======================


function chooseBook(items,input){


let key =
input.toLowerCase();



let found =
items.find(item=>{


let title =
item.volumeInfo.title
?
item.volumeInfo.title.toLowerCase()
:
"";


return title.includes(key)
||
key.includes(title);


});



return found || items[0];

}








// =======================
// Create NILAM
// =======================


function generateNilam(book){


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
getISBN(book.industryIdentifiers);



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
createSummary(
title,
category
),



"Pengajaran":
createLesson(category)



};



showData();


}







// =======================
// Open Library
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
"Buku ini menceritakan pengalaman dan perjalanan watak utama serta nilai kehidupan.",


"Pengajaran":
"Kita perlu berusaha, bertanggungjawab dan menghargai orang lain."


};



showData();


}







// =======================
// Display
// =======================


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
onclick="copyText('${value}')">

📋 Copy ${key}

</button>


</div>


`;



});


updateProgress();


}






// =======================
// Copy
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
// Auto classify
// =======================


function detectType(title){


let t =
title.toLowerCase();



if(
t.includes("science")
||
t.includes("habit")
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


return "Umum";


}





function detectLanguage(title){


if(
/[a-z]/i.test(title)
)

return "English";


return "Bahasa Melayu";


}







function createSummary(title,category){


return (

title+
" ialah buku kategori "+
category+
" yang membawa cerita, pengalaman dan nilai kehidupan."

);


}




function createLesson(category){


if(category==="Fantasi")


return "Kita perlu berani, setia dan menghargai persahabatan.";



return "Buku ini mengajar disiplin, usaha dan tanggungjawab.";


}






function getISBN(ids){


if(!ids)
return "Unknown";


return ids[0].identifier;


}







// =======================
// Progress
// =======================


function updateProgress(){


let count =
Number(localStorage.getItem("bookCount")||0);



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
+
"%";


}

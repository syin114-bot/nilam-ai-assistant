// NILAM AI Assistant 3.0
// Google Books + Open Library + Smart NILAM Generator


let currentData = {};



// 搜索书
async function searchBook(){


const input =
document.getElementById("searchInput").value.trim();


if(!input){
alert("Enter book title");
return;
}


document
.getElementById("result")
.classList.remove("hidden");


document.getElementById("nilamData").innerHTML =
`
<p>🔎 Searching...</p>
`;



try{


// Google Books

let googleURL =
"https://www.googleapis.com/books/v1/volumes?q="
+
encodeURIComponent(input)
+
"&maxResults=10";



let googleRes =
await fetch(googleURL);


let googleData =
await googleRes.json();



if(googleData.items && googleData.items.length > 0){


let book =
chooseBest(
googleData.items,
input
);


let info =
book.volumeInfo;



let extra =
await getOpenLibrary(
info.title
);



generateNilam(
{
...info,
...extra
});


return;


}


}




throw Error("no");



}

catch(e){


document.getElementById("nilamData").innerHTML =
`
<p>❌ Book not found</p>
`;

}


}






// 选择最像的书

function chooseBest(items,input){


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







// Open Library 补资料

async function getOpenLibrary(title){


try{


let url =
"https://openlibrary.org/search.json?q="
+
encodeURIComponent(title);



let res =
await fetch(url);



let data =
await res.json();



let book =
data.docs[0];



return{


pageCount:
book.number_of_pages_median,


publisher:
book.publisher?
book.publisher[0]
:
null,


isbn:
book.isbn?
book.isbn[0]
:
null



};


}

catch{

return {};

}


}








// 生成 NILAM

function generateNilam(book){



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
||
book.number_of_pages_median
||
"Unknown",



"ISBN":
getISBN(book)
||
book.isbn
||
"Unknown",



"Penulis":
book.authors?
book.authors.join(", ")
:
book.author_name?
book.author_name.join(", ")
:
"Unknown",



"Penerbit":
book.publisher
||
"Unknown",



"Tahun Terbitan":
(book.publishedDate||"")
.substring(0,4)
||
book.first_publish_year
||
"Unknown",



"Bahasa":
detectLanguage(title),



"Rumusan":
makeSummary(
title,
category
),



"Pengajaran":
makeLesson(
title,
category
)



};



showData();



}









// 显示

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


<button onclick="copyText('${value.replace(/'/g,"")}')">

📋 Copy ${key}

</button>


</div>


`;


});


updateProgress();


}







// Copy

function copyText(text){


navigator.clipboard.writeText(text);


alert("Copied");


}



function copyAll(){


let text="";


for(let i in currentData){


text+=
i+
": "+
currentData[i]
+
"\n\n";


}



navigator.clipboard.writeText(text);


alert("Copied all NILAM");


}







// 分类

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
||
t.includes("mind")
)

return "Motivasi";



if(
t.includes("science")
||
t.includes("history")
)

return "Sains";


return "Umum";


}





function detectType(title){


if(
detectCategory(title)
==="Motivasi"
||
detectCategory(title)
==="Sains"
)

return "Buku Bukan Fiksyen";



return "Buku Fiksyen";


}







function detectLanguage(title){


if(
/[\u4e00-\u9fa5]/.test(title)
)

return "Chinese";



return "English";


}







// 智能 Rumusan

function makeSummary(title,cat){


if(cat==="Fantasi")

return (
"Buku ini mengisahkan perjalanan watak utama dalam dunia fantasi yang penuh cabaran, keberanian dan persahabatan."
);



if(cat==="Motivasi")

return (
"Buku ini menerangkan cara membina pemikiran positif dan memperbaiki kehidupan melalui perubahan kecil."
);



if(cat==="Sains")

return (
"Buku ini menerangkan ilmu pengetahuan serta membantu pembaca memahami dunia dengan lebih baik."
);



return (
"Buku ini menceritakan pengalaman watak utama serta menyampaikan nilai kehidupan yang penting."
);


}







// 智能 Pengajaran

function makeLesson(title,cat){


if(cat==="Fantasi")

return (
"Kita perlu berani menghadapi cabaran dan menghargai persahabatan."
);



if(cat==="Motivasi")

return (
"Kita perlu berdisiplin, berusaha dan tidak mudah berputus asa."
);



if(cat==="Sains")

return (
"Kita perlu mempunyai rasa ingin tahu dan terus belajar."
);



return (
"Kita perlu bertanggungjawab serta menghormati orang lain."
);



}






function getISBN(book){


if(!book.industryIdentifiers)
return null;


return book.industryIdentifiers[0].identifier;


}







function updateProgress(){


let count =
Number(
localStorage.getItem("bookCount")
||
0
);



document.getElementById("bookCount")
.innerText=count;



document.getElementById("progressBar")
.style.width =
Math.min(
count/720*100,
100
)
+
"%";


}

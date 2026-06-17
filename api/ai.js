// Vercel Serverless Function
// NILAM AI Assistant


export default async function handler(req,res){


if(req.method !== "POST"){

return res.status(405).json({
error:"Method not allowed"
});

}



try{


const {
title,
author,
language,
pages,
publisher
}=req.body;



if(!title){

return res.status(400).json({
error:"Missing title"
});

}



const prompt = `

You are a Malaysian NILAM reading assistant.

Generate NILAM information.

Book title:
${title}

Author:
${author || "Unknown"}

Publisher:
${publisher || "Unknown"}

Current pages:
${pages || "Unknown"}


Return ONLY JSON.

{
"Rumusan":"",
"Pengajaran":"",
"Kategori":"",
"Jenis buku":"",
"Bahasa":"",
"Mukasurat":"",
"Penerbit":""
}


Rules:

- Write in Malay language.
- Rumusan minimum 15 words.
- Pengajaran minimum 8 words.
- Make answers different for every book.
- If page count is missing, estimate a common edition and add "(anggaran)".
- If publisher unknown, provide likely publisher or "Unknown".
- Do not return markdown.
`;




const response =
await fetch(
"https://api.openai.com/v1/chat/completions",
{


method:"POST",


headers:{


"Content-Type":
"application/json",


"Authorization":
`Bearer ${process.env.OPENAI_API_KEY}`

},



body:JSON.stringify({


model:"gpt-4.1-mini",


messages:[

{
role:"user",
content:prompt
}

],


temperature:0.7


})


});




const data =
await response.json();



const text =
data.choices[0]
.message
.content;



let clean =
text
.replace(/```json/g,"")
.replace(/```/g,"")
.trim();



res.json(
JSON.parse(clean)
);



}
catch(error){


console.log(error);


res.status(500).json({

error:"AI failed"

});


}


}

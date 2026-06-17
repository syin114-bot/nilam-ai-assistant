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
pages,
publisher
}=req.body;



if(!title){

return res.status(400).json({
error:"Missing title"
});

}



const prompt = `

You are a Malaysian NILAM assistant.

Generate NILAM data.

Book:
${title}

Author:
${author || "Unknown"}

Publisher:
${publisher || "Unknown"}

Pages:
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

- Malay language only
- Rumusan minimum 15 words
- Pengajaran minimum 8 words
- Make every answer unique
- If pages missing estimate and add "(anggaran)"
- No markdown

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



if(!data.choices){

console.log(data);


return res.status(500).json({

error:"OpenAI error"

});


}



let text =
data.choices[0]
.message
.content;



text =
text
.replace(/```json/g,"")
.replace(/```/g,"")
.trim();



return res.json(
JSON.parse(text)
);



}

catch(error){


console.log(error);


return res.status(500).json({

error:"AI failed"

});


}


}

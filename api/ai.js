// Vercel Serverless Function
// NILAM AI Assistant

export default async function handler(req, res) {


    // 只允许 POST
    if(req.method !== "POST"){
        return res.status(405).json({
            error:"Method not allowed"
        });
    }



    try{


        const {
            title,
            author,
            language
        } = req.body;



        if(!title){
            return res.status(400).json({
                error:"Missing title"
            });
        }



        const prompt = `

You are a NILAM reading assistant.

Generate Malaysian NILAM book information.

Book title:
${title}

Author:
${author || "Unknown"}

Language:
${language || "English"}


Return ONLY JSON:

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

- Rumusan minimum 10 words
- Pengajaran minimum 5 words
- Use Malay language
- Make different answer for every book
- If page or publisher unknown, give reasonable estimate and mark anggaran

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


                temperature:0.8


            })


        });



        const data =
        await response.json();



        const text =
        data.choices[0]
        .message
        .content;



        res.json(
            JSON.parse(text)
        );



    }
    catch(error){


        console.log(error);


        res.status(500).json({

            error:"AI failed"

        });


    }



}

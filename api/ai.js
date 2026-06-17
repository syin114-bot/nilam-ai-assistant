export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { title, author, pages, publisher } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Missing title" });
    }

    const prompt = `
You are a Malaysian NILAM assistant.

Generate in STRICT JSON ONLY. Use Bahasa Melayu.

Return exactly this format:

{
  "rumusan": "ringkasan buku yang panjang dan lengkap (sekurang-kurangnya 15 patah perkataan)",
  "pengajaran": "pengajaran atau nilai yang dipelajari (sekurang-kurangnya 8 patah perkataan)",
  "kategori": "Fantasi / Novel / Motivasi / Sejarah / dll",
  "jenis_buku": "Fiksyen / Bukan Fiksyen",
  "bahasa": "English / Bahasa Melayu",
  "mukasurat": "345",
  "penerbit": "Bloomsbury Publishing"
}

Book:
Title: ${title}
Author: ${author || "Unknown"}
Pages: ${pages || "Unknown"}
Publisher: ${publisher || "Unknown"}
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 800,
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();

    if (!data.choices?.[0]?.message?.content) {
      return res.status(500).json({ error: "OpenAI failed" });
    }

    let result = {};
    try {
      result = JSON.parse(data.choices[0].message.content);
    } catch (e) {
      console.log("PARSE FAIL:", data.choices[0].message.content);
      result = {};
    }

    return res.json({
      rumusan: result.rumusan || "Ringkasan tidak dapat dijana.",
      pengajaran: result.pengajaran || "Sila cuba semula.",
      kategori: result.kategori || "-",
      jenis_buku: result.jenis_buku || "-",
      bahasa: result.bahasa || "English",
      mukasurat: result.mukasurat || (pages || "-"),
      penerbit: result.penerbit || (publisher || "-")
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "AI failed", message: error.message });
  }
}

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

Generate NILAM data in STRICT JSON ONLY.

Rules:
- Malay language only
- No markdown
- No explanation

Return format:

{
  "rumusan": "",
  "pengajaran": "",
  "kategori": "",
  "jenis_buku": "",
  "bahasa": "",
  "mukasurat": "",
  "penerbit": ""
}

Book:
Title: ${title}
Author: ${author || "Unknown"}
Pages: ${pages || "Unknown"}
Publisher: ${publisher || "Unknown"}
`;

const response = await fetch(
  "https://api.openai.com/v1/chat/completions",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      response_format: { type: "json_object" }
    })
  }
);

const data = await response.json();

if (!data.choices?.[0]) {
  return res.status(500).json({
    error: "OpenAI failed",
    raw: data
  });
}

// 🔥 核心升级：安全解析
let result = {};

try {
  result = JSON.parse(data.choices[0].message.content);
} catch (e) {
  console.log("PARSE FAIL RAW:", data.choices[0].message.content);

  // fallback（不会让前端 undefined）
  result = {
    rumusan: "Data tidak dapat dijana",
    pengajaran: "Sila cuba semula",
    kategori: "-",
    jenis_buku: "-",
    bahasa: "-",
    mukasurat: pages || "-",
    penerbit: publisher || "-"
  };
}

return res.json(result);

} catch (error) {
console.log(error);

return res.status(500).json({
  error: "AI failed",
  message: error.message
});
}
}

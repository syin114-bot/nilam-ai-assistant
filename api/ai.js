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
You are a Malaysian NILAM assistant. Generate in STRICT JSON ONLY.

Rules:
- All text in Bahasa Melayu
- Rumusan ≥ 15 words
- Pengajaran ≥ 8 words
- No markdown, no explanation, no extra text

Return exactly this JSON format:

{
  "rumusan": "ringkasan buku yang lengkap dan menarik...",
  "pengajaran": "nilai atau pengajaran yang dapat dipelajari...",
  "kategori": "Novel / Fantasi / Motivasi / Sejarah / dll",
  "jenis_buku": "Fiksyen / Bukan Fiksyen",
  "bahasa": "Bahasa Melayu / English",
  "mukasurat": "320 atau anggaran",
  "penerbit": "Nama penerbit"
}

Book Information:
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
        model: "gpt-4o-mini",           // 推荐改用这个，更稳定
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 800,
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();

    if (!data.choices?.[0]?.message?.content) {
      return res.status(500).json({ error: "OpenAI failed", raw: data });
    }

    let result = {};

    try {
      result = JSON.parse(data.choices[0].message.content);
    } catch (e) {
      console.error("JSON Parse Error:", data.choices[0].message.content);
      
      // Fallback
      result = {
        rumusan: "Ringkasan tidak dapat dijana. Sila cuba tajuk yang lebih tepat.",
        pengajaran: "Sila cuba semula.",
        kategori: "Umum",
        jenis_buku: "Fiksyen",
        bahasa: "Bahasa Melayu",
        mukasurat: pages || "Unknown",
        penerbit: publisher || "Unknown"
      };
    }

    // 统一返回大写和小写 key，兼容 frontend
    return res.json({
      rumusan: result.rumusan || result.Rumusan || "AI gagal menjana rumusan.",
      pengajaran: result.pengajaran || result.Pengajaran || "AI gagal menjana pengajaran.",
      kategori: result.kategori || result.Kategori || "-",
      jenis_buku: result.jenis_buku || result["jenis buku"] || result.Jenis_buku || "-",
      bahasa: result.bahasa || result.Bahasa || "Bahasa Melayu",
      mukasurat: result.mukasurat || result.Mukasurat || (pages || "-"),
      penerbit: result.penerbit || result.Penerbit || (publisher || "-")
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "AI failed",
      message: error.message
    });
  }
}

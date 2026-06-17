// NILAM AI Assistant - Fixed & Improved Version
let currentData = {};

// =======================
// SEARCH
// =======================
async function searchBook() {
  const input = document.getElementById("searchInput").value.trim();

  if (!input) {
    alert("Please enter book title");
    return;
  }

  document.getElementById("result").classList.remove("hidden");
  document.getElementById("nilamData").innerHTML = `
    <div class="loading">🔎 Searching for "${input}"...</div>
  `;

  try {
    // Google Books 优先
    let url = `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(input)}&maxResults=5`;
    let response = await fetch(url);
    let data = await response.json();

    if (data.items && data.items.length > 0) {
      let chosen = chooseBook(data.items, input);
      if (chosen) {
        await generateNilam(chosen.volumeInfo);
        return;
      }
    }

    // Open Library 备份
    let openURL = `https://openlibrary.org/search.json?q=${encodeURIComponent(input)}&limit=3`;
    let openResponse = await fetch(openURL);
    let openData = await openResponse.json();

    if (openData.docs && openData.docs.length > 0) {
      generateOpenLibrary(openData.docs[0]);
      return;
    }

    // 如果两个 API 都失败，直接用书名调用 AI
    console.log("📌 No external data found, generating with AI only");
    await generateNilam({ title: input });

  } catch (error) {
    console.error("Search Error:", error);
    // 即使出错也继续生成
    await generateNilam({ title: input });
  }
}

// =======================
// CHOOSE BOOK
// =======================
function chooseBook(items, input) {
  const key = input.toLowerCase().trim();

  for (let item of items) {
    const title = (item.volumeInfo.title || "").toLowerCase();
    const subtitle = (item.volumeInfo.subtitle || "").toLowerCase();
    const full = (title + " " + subtitle).trim();

    if (full.includes(key) || key.includes(title)) {
      return item;
    }
  }
  return items[0];
}

// =======================
// CREATE NILAM
// =======================
async function generateNilam(book) {
  const title = book.title || "Unknown";
  const author = book.authors ? book.authors.join(", ") : "Unknown";
  const publisher = book.publisher || "Unknown";
  const pages = book.pageCount || "Unknown";
  const year = book.publishedDate ? book.publishedDate.substring(0, 4) : "Unknown";
  const isbn = getISBN(book.industryIdentifiers);

  const language = detectLanguage(title);
  const type = detectType(title);
  const category = detectCategory(title);

  currentData = {
    "Tarikh": new Date().toLocaleDateString("en-GB"),
    "Tajuk": title,
    "Jenis buku": type,
    "Kategori": category,
    "Bilangan mukasurat": pages,
    "ISBN": isbn,
    "Penulis": author,
    "Penerbit": publisher,
    "Tahun Terbitan": year,
    "Bahasa": language,
    "Rumusan": "AI generating...",
    "Pengajaran": "AI generating..."
  };

  showData();

  // 调用 AI
  let ai = await getAI({
    title: title,
    author: author,
    pages: pages,
    publisher: publisher
  });

  if (ai) {
    console.log("AI RESPONSE:", ai);

    currentData["Rumusan"] = ai.rumusan || ai.Rumusan || "AI gagal menjana rumusan";
    currentData["Pengajaran"] = ai.pengajaran || ai.Pengajaran || "AI gagal menjana pengajaran";
    currentData["Kategori"] = ai.kategori || ai.Kategori || category;
    currentData["Jenis buku"] = ai.jenis_buku || ai["jenis buku"] || ai["Jenis buku"] || type;
    currentData["Bahasa"] = ai.bahasa || ai.Bahasa || language;
    currentData["Bilangan mukasurat"] = ai.mukasurat || ai.Mukasurat || pages;
    currentData["Penerbit"] = ai.penerbit || ai.Penerbit || publisher;

    showData();
  } else {
    currentData["Rumusan"] = "Gagal mendapatkan data dari AI. Sila semak API key.";
    currentData["Pengajaran"] = "Sila cuba lagi.";
    showData();
  }
}

// =======================
// OPEN LIBRARY
// =======================
function generateOpenLibrary(book) {
  currentData = {
    "Tarikh": new Date().toLocaleDateString("en-GB"),
    "Tajuk": book.title || "Unknown",
    "Jenis buku": "Buku Fiksyen",
    "Kategori": "Umum",
    "Bilangan mukasurat": book.number_of_pages_median || "Unknown",
    "ISBN": book.isbn ? book.isbn[0] : "Unknown",
    "Penulis": book.author_name ? book.author_name.join(", ") : "Unknown",
    "Penerbit": book.publisher ? book.publisher[0] : "Unknown",
    "Tahun Terbitan": book.first_publish_year || "Unknown",
    "Bahasa": "English",
    "Rumusan": "AI generating...",
    "Pengajaran": "AI generating..."
  };

  showData();

  getAI({
    title: book.title,
    author: currentData["Penulis"],
    pages: currentData["Bilangan mukasurat"],
    publisher: currentData["Penerbit"]
  }).then(ai => {
    if (ai) {
      currentData["Rumusan"] = ai.rumusan || ai.Rumusan || "AI gagal menjana rumusan";
      currentData["Pengajaran"] = ai.pengajaran || ai.Pengajaran || "AI gagal menjana pengajaran";
      showData();
    }
  });
}

// =======================
// AI API
// =======================
async function getAI(info) {
  try {
    let res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(info)
    });

    const data = await res.json();
    console.log("AI Raw Response:", data);
    return data;
  } catch (error) {
    console.error("getAI Error:", error);
    return null;
  }
}

// =======================
// DISPLAY
// =======================
function showData() {
  let box = document.getElementById("nilamData");
  box.innerHTML = "";

  Object.entries(currentData).forEach(([key, value]) => {
    box.innerHTML += `
      <div class="nilam-item">
        <div class="nilam-title">${key}</div>
        <div>${value}</div>
        <button class="copy-btn" onclick="copyText('${String(value).replace(/'/g, "\\'")}')">
          📋 Copy ${key}
        </button>
      </div>
    `;
  });

  updateProgress();
}

// =======================
// COPY
// =======================
function copyText(text) {
  navigator.clipboard.writeText(text).then(() => alert("Copied!"));
}

function copyAll() {
  let text = "";
  for (let key in currentData) {
    text += `${key}:\n${currentData[key]}\n\n`;
  }
  navigator.clipboard.writeText(text).then(() => alert("All NILAM copied!"));
}

// =======================
// CLASSIFY
// =======================
function detectType(title) {
  let t = title.toLowerCase();
  if (t.includes("science") || t.includes("history") || t.includes("guide")) {
    return "Buku Bukan Fiksyen";
  }
  return "Buku Fiksyen";
}

function detectCategory(title) {
  let t = title.toLowerCase();
  if (t.includes("harry") || t.includes("magic") || t.includes("dragon")) return "Fantasi";
  if (t.includes("success") || t.includes("habit")) return "Motivasi";
  return "Umum";
}

function detectLanguage(title) {
  return /[a-z]/i.test(title) ? "English" : "Bahasa Melayu";
}

function getISBN(ids) {
  if (!ids || !ids.length) return "Unknown";
  return ids[0].identifier || "Unknown";
}

// =======================
// PROGRESS
// =======================
function updateProgress() {
  let count = Number(localStorage.getItem("bookCount") || 0);
  count++;
  localStorage.setItem("bookCount", count);

  let counter = document.getElementById("bookCount");
  let bar = document.getElementById("progressBar");

  if (counter) counter.innerText = count;
  if (bar) bar.style.width = Math.min((count / 720) * 100, 100) + "%";
}

// NILAM AI Assistant - Fixed Version
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
    <div class="loading">🔎 Searching book...</div>
  `;

  try {
    // Google Books
    let url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(input)}&maxResults=10`;
    let response = await fetch(url);
    let data = await response.json();

    if (data.items) {
      let chosen = chooseBook(data.items, input);
      if (chosen) {
        await generateNilam(chosen.volumeInfo);
        return;
      }
    }

    // Open Library Backup
    let openURL = `https://openlibrary.org/search.json?q=${encodeURIComponent(input)}`;
    let openResponse = await fetch(openURL);
    let openData = await openResponse.json();

    if (openData.docs && openData.docs.length) {
      generateOpenLibrary(openData.docs[0]);
      return;
    }

    throw new Error("Not found");

  } catch (error) {
    document.getElementById("nilamData").innerHTML = `
      <p>❌ 找不到资料<br>Try another title</p>
    `;
  }
}

// =======================
// CHOOSE BOOK
// =======================
function chooseBook(items, input) {
  const key = input.toLowerCase();
  return items.find(item => {
    const title = (item.volumeInfo.title || "").toLowerCase();
    return title.includes(key) || key.includes(title);
  }) || items[0];
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

  // Call AI
  const ai = await getAI({ title, author, pages, publisher });

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
    console.log("AI Raw Data:", data);   // 方便调试
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

// =======================
// DISPLAY + COPY + 其他函数保持不变
// =======================
function showData() {
  let box = document.getElementById("nilamData");
  box.innerHTML = "";

  Object.entries(currentData).forEach(([key, value]) => {
    box.innerHTML += `
      <div class="nilam-item">
        <div class="nilam-title">${key}</div>
        <div>${value}</div>
        <button class="copy-btn" onclick="copyText('${value.replace(/'/g, "\\'")}')">
          📋 Copy ${key}
        </button>
      </div>
    `;
  });

  updateProgress();
}

function copyText(text) {
  navigator.clipboard.writeText(text);
  alert("Copied!");
}

function copyAll() {
  let text = "";
  for (let key in currentData) {
    text += `${key}:\n${currentData[key]}\n\n`;
  }
  navigator.clipboard.writeText(text);
  alert("All NILAM copied!");
}

// 以下 detectType, detectCategory, detectLanguage, getISBN, updateProgress 函数保持不变
function detectType(title) { /* ... */ }
function detectCategory(title) { /* ... */ }
function detectLanguage(title) { /* ... */ }
function getISBN(ids) { /* ... */ }
function updateProgress() { /* ... */ }

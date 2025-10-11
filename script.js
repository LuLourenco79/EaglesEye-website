
// hamburger menu

const hamMenu = document.querySelector('.ham-menu');

const offScreenMenu = document.querySelector('.off-screen-menu');

hamMenu.addEventListener('click', () => {
  hamMenu.classList.toggle('active');
  offScreenMenu.classList.toggle('active');
})

// sold out alert

function wireListing(listingEl) {
  listingEl.addEventListener('click', (e) => {
    // Accept either a specifically-classed button or any <li> > <button>
    const btn = e.target.closest('button.listingitem-btn, .listing-container li > button');
    if (!btn || !listingEl.contains(btn)) return;

    e.preventDefault();          // stop form submits, just in case
    alert('This item is currently sold out.');
  });
}

function init() {
  document.querySelectorAll('.listing').forEach(wireListing);
}

//Contact Us 

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  if (!form) return; // safely exit on pages without the form

  const textarea = document.getElementById('message');
  const countEl  = document.getElementById('contactWordCount');
  const statusEl = document.getElementById('contactStatus');

  // Word counter + 100-word hard cap
  if (textarea && countEl) {
    textarea.addEventListener('input', () => {
      const words = textarea.value.trim().split(/\s+/).filter(Boolean);
      if (words.length > 100) {
        textarea.value = words.slice(0, 100).join(' ');
        countEl.textContent = '100';
      } else {
        countEl.textContent = String(words.length);
      }
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (statusEl) statusEl.textContent = 'Sending...';

    const payload = {
      firstName: document.getElementById('firstName')?.value.trim() || '',
      lastName:  document.getElementById('lastName')?.value.trim()  || '',
      email:     document.getElementById('email')?.value.trim()     || '',
      message:   textarea?.value.trim()                              || '',
      website:   form.querySelector('input[name="website"]')?.value.trim() || '' // honeypot
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Request failed');

      if (statusEl) statusEl.textContent = 'Thanks! Your message has been sent.';
      form.reset();
      if (countEl) countEl.textContent = '0';
    } catch (err) {
      if (statusEl) statusEl.textContent = 'Sorry—there was a problem sending your message. Please try again.';
    }
  });
});


//Checklist - main

console.info("[Checklist v7] href:", location.href);

// ===== CONFIG =====
const PDF_URL = "~/assets/GemRush_Checklist.pdf"; // make sure the file name/case matches exactly

// ===== HELPERS =====
function normalizeLines(text) {
  return text
    .split(/\r?\n/)
    .map(t => t.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function isLikelyTitleOrNoise(line) {
  const lower = line.toLowerCase();
  return (
    lower === "checklist" ||
    lower === "gem" ||
    /^page\s+\d+$/i.test(line) ||
    /^[-—]+$/.test(line)
  );
}

function renderList(lines) {
  const ul = document.getElementById("checklist");
  if (!ul) {
    console.error("❌ #checklist not found. Found containers:",
      document.querySelectorAll(".checklist-container").length);
    return 0;
  }
  ul.innerHTML = "";
  let count = 0;
  for (const line of lines) {
    if (isLikelyTitleOrNoise(line)) continue;
    const li = document.createElement("li");
    li.textContent = line;
    ul.appendChild(li);
    count++;
  }
  return count;
}

async function extractPdfTextLines(url) {
  const pdfjsLib = window["pdfjs-dist/build/pdf"] || window.pdfjsLib;
  if (!pdfjsLib) throw new Error("PDF.js failed to load. Check the <script> src URL.");

  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.min.js";

  const loadingTask = pdfjsLib.getDocument({
    url,
    isEvalSupported: false,
    useSystemFonts: true
  });

  const pdf = await loadingTask.promise;
  const all = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const tc = await page.getTextContent();
    const pageText = tc.items.map(i => i.str).join("\n");
    all.push(...normalizeLines(pageText));
  }
  return all;
}

async function initChecklist() {
  // Debug what the DOM actually contains at runtime
  const containers = document.querySelectorAll(".checklist-container");
  console.log("[Checklist] containers found:", containers.length);

  // Only run if the checklist container exists on this page
  const container = document.querySelector(".checklist-container");
  if (!container) {
    console.warn("ℹ️ No .checklist-container on this page; skipping.");
    return;
  }

  // Look up elements INSIDE the container to avoid cross-page conflicts
  const statusEl = container.querySelector("#status");
  const printBtn = container.querySelector("#printBtn");

  if (!statusEl) {
    console.error("❌ No element with id='status' found inside .checklist-container.");
    console.log("Container HTML snapshot:", container.innerHTML);
    return;
  }

  if (printBtn) {
    printBtn.addEventListener("click", () => window.print());
  }

  statusEl.textContent = "Loading list from PDF…";
  try {
    // Quick path check
    try {
      const probe = await fetch(PDF_URL, { method: "GET" });
      console.log("[Checklist] fetch probe:", PDF_URL, probe.status, probe.ok, probe.url);
      if (!probe.ok) throw new Error(`HTTP ${probe.status} for ${probe.url}`);
    } catch (e) {
      console.error("[Checklist] fetch probe failed:", e);
      throw e;
    }

    const lines = await extractPdfTextLines(PDF_URL);
    const count = renderList(lines);
    statusEl.textContent = count
      ? `Loaded ${count} items from PDF.`
      : "No items found. If the PDF is a scan, there may be no extractable text.";
  } catch (err) {
    console.error(err);
    statusEl.textContent =
      "Couldn’t read the PDF. Check console for details (path, CORS, mixed content).";
  }
}

// Run after DOM is parsed (works with or without defer)
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initChecklist);
} else {
  initChecklist();
}


// Run after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

document.getElementById('year').textContent = new Date().getFullYear();


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



// FAQs

document.querySelectorAll(".faq-question").forEach((btn) => {
  btn.addEventListener("click", () => {
    const item = btn.parentElement;
    item.classList.toggle("active");
  });
});



// Run after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

document.getElementById('year').textContent = new Date().getFullYear();

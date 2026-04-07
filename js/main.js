/* ============================================================
   WEDDING INVITATION — js/main.js
   Trung Phẩm & Thu Yến · 14/06/2026
   ============================================================ */

/* ── Init AOS ─────────────────────────────────────────────── */
AOS.init({
    once: true,
    offset: 80,
    duration: 850,
    easing: 'ease-out-cubic'
});

/* ── Wedding date ─────────────────────────────────────────── */
const WEDDING_DATE = new Date('2026-06-14T10:00:00');

/* ===============================================================
   COUNTDOWN TIMER
=============================================================== */
function updateCountdown() {
    const now = new Date();
    const diff = WEDDING_DATE - now;

    if (diff <= 0) {
        const el = document.getElementById('countdown');
        if (el) el.innerHTML = '<div class="countdown-over">💍 Hôm nay là ngày cưới!</div>';
        return;
    }

    const days = Math.floor(diff / 864e5);
    const hours = Math.floor((diff % 864e5) / 36e5);
    const minutes = Math.floor((diff % 36e5) / 6e4);
    const seconds = Math.floor((diff % 6e4) / 1e3);

    setText('days', pad(days));
    setText('hours', pad(hours));
    setText('minutes', pad(minutes));
    setText('seconds', pad(seconds));
}

function pad(n) { return String(n).padStart(2, '0'); }
function setText(id, v) { const el = document.getElementById(id); if (el) el.textContent = v; }

setInterval(updateCountdown, 1000);
updateCountdown();

/* ===============================================================
   NAVIGATION DOTS — highlight active section
=============================================================== */
const sections = document.querySelectorAll('section[id]');
const dots = document.querySelectorAll('#nav-dots .dot');

const sectionObserver = new IntersectionObserver(
    entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                dots.forEach(d => d.classList.remove('active'));
                const active = document.querySelector(`#nav-dots [data-section="${e.target.id}"]`);
                if (active) active.classList.add('active');
            }
        });
    },
    { threshold: 0.4 }
);

sections.forEach(s => sectionObserver.observe(s));

/* ===============================================================
   BACK TO TOP BUTTON
=============================================================== */
const backTopBtn = document.getElementById('back-top');
window.addEventListener('scroll', () => {
    if (backTopBtn) {
        backTopBtn.classList.toggle('visible', window.scrollY > 400);
    }
}, { passive: true });

/* ===============================================================
   SCROLL TO GUESTBOOK
=============================================================== */
function scrollToGuestbook() {
    const el = document.getElementById('guestbook');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ===============================================================
   LIGHTBOX GALLERY
=============================================================== */
let lightboxImages = [];
let lightboxCurrent = 0;

function openLightbox(item) {
    const lb = document.getElementById('lightbox');
    if (!lb) return;

    // Collect all gallery images
    lightboxImages = Array.from(document.querySelectorAll('.gallery-item img'));
    lightboxCurrent = lightboxImages.findIndex(i => i === item.querySelector('img'));
    if (lightboxCurrent === -1) lightboxCurrent = 0;

    showLightboxImage(lightboxCurrent);
    lb.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function showLightboxImage(index) {
    const img = document.getElementById('lightbox-img');
    if (img && lightboxImages[index]) {
        img.src = lightboxImages[index].src;
        img.alt = lightboxImages[index].alt;
    }
}

function moveLightbox(dir) {
    lightboxCurrent = (lightboxCurrent + dir + lightboxImages.length) % lightboxImages.length;
    showLightboxImage(lightboxCurrent);
}

function closeLightbox() {
    const lb = document.getElementById('lightbox');
    if (lb) lb.classList.remove('active');
    document.body.style.overflow = '';
}

// Open lightbox for a single image (couple portraits)
function openCoupleLightbox(src, alt) {
    const lb = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');
    if (!lb || !img) return;
    lightboxImages = [{ src, alt }];
    lightboxCurrent = 0;
    img.src = src;
    img.alt = alt || '';
    lb.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Keyboard navigation
document.addEventListener('keydown', e => {
    const lb = document.getElementById('lightbox');
    if (!lb || !lb.classList.contains('active')) return;
    if (e.key === 'ArrowRight') moveLightbox(1);
    if (e.key === 'ArrowLeft') moveLightbox(-1);
    if (e.key === 'Escape') closeLightbox();
});

/* ===============================================================
   GUESTBOOK — lưu trữ qua JSONBin.io
   Hướng dẫn setup:
   1. Đăng ký miễn phí tại https://jsonbin.io
   2. Vào "Bins" → Create New Bin, nội dung: {"wishes":[]}
   3. Copy BIN_ID (chuỗi dài trong URL) và Master Key
   4. Điền vào JSONBIN_BIN_ID và JSONBIN_API_KEY bên dưới
=============================================================== */
const JSONBIN_BIN_ID = '69d48d02856a68218907f3c7';   // ← điền vào đây
const JSONBIN_API_KEY = '$2a$10$RNY0FQht13zOznymwXygFu//dYtP4w3mZUvUpKdDKScY5KTO7s5zS'; // ← điền vào đây
const JSONBIN_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`;

async function loadWishes() {
    try {
        const res = await fetch(`${JSONBIN_URL}/latest`, {
            headers: { 'X-Master-Key': JSONBIN_API_KEY }
        });
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data.record?.wishes) ? data.record.wishes : [];
    } catch {
        return [];
    }
}

async function saveWishes(newWish) {
    const wishes = await loadWishes();
    wishes.push(newWish);
    await fetch(JSONBIN_URL, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-Master-Key': JSONBIN_API_KEY
        },
        body: JSON.stringify({ wishes })
    });
    return wishes;
}

async function renderWishes() {
    const list = document.getElementById('wish-list');
    if (!list) return;

    list.innerHTML = '<p class="no-wishes italic-text">Đang tải lời chúc... 💕</p>';
    const wishes = await loadWishes();

    if (wishes.length === 0) {
        list.innerHTML = '<p class="no-wishes">Chưa có lời chúc nào. Hãy là người đầu tiên! 💕</p>';
        return;
    }

    list.innerHTML = wishes.slice().reverse().map(w => `
    <div class="wish-card">
      <div class="wish-card-name">${escapeHtml(w.name)}</div>
      <div class="wish-card-msg">${escapeHtml(w.message)}</div>
      <div class="wish-card-time">${w.time}</div>
    </div>
  `).join('');
}

async function submitWish(e) {
    e.preventDefault();
    const nameEl = document.getElementById('wish-name');
    const msgEl = document.getElementById('wish-message');
    if (!nameEl || !msgEl) return;

    const name = nameEl.value.trim();
    const message = msgEl.value.trim();
    if (!name || !message) return;

    const btn = e.target.querySelector('[type="submit"]');
    if (btn) { btn.disabled = true; btn.textContent = 'Đang gửi...'; }

    await saveWishes({ name, message, time: formatDate(new Date()) });
    await renderWishes();

    document.getElementById('wish-form').reset();
    document.getElementById('char-count').textContent = '0';
    if (btn) { btn.disabled = false; btn.textContent = 'GỬI LỜI CHÚC'; }

    showToast('🎉 Lời chúc của bạn đã được gửi!');
}

// Character counter
const msgArea = document.getElementById('wish-message');
if (msgArea) {
    msgArea.addEventListener('input', () => {
        const counter = document.getElementById('char-count');
        if (counter) counter.textContent = msgArea.value.length;
    });
}

renderWishes();

/* ===============================================================
   RSVP MODAL
=============================================================== */
const RSVP_KEY = 'wedding_rsvp_tp_ty_2026';

function openRsvpModal() {
    const modal = document.getElementById('rsvp-modal');
    if (!modal) return;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    renderRsvpList();
}

function closeRsvpModal() {
    const modal = document.getElementById('rsvp-modal');
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

function submitRsvp(e) {
    e.preventDefault();
    const nameEl = document.getElementById('rsvp-name');
    const attendEl = document.getElementById('rsvp-attending');
    const guestsEl = document.getElementById('rsvp-guests');
    if (!nameEl || !attendEl || !guestsEl) return;

    const name = nameEl.value.trim();
    const attending = attendEl.value;
    const guests = parseInt(guestsEl.value, 10) || 1;
    if (!name || !attending) return;

    const rsvps = loadRsvps();
    rsvps.push({ name, attending, guests, time: formatDate(new Date()) });
    localStorage.setItem(RSVP_KEY, JSON.stringify(rsvps));

    document.getElementById('rsvp-form').reset();

    const msg = attending === 'yes'
        ? `🎉 Cảm ơn ${name}! Hẹn gặp bạn ngày 14/06/2026!`
        : `💌 Cảm ơn ${name} đã thông báo. Chúc bạn mọi điều tốt lành!`;

    showToast(msg);
    renderRsvpList();
}

function loadRsvps() {
    try {
        return JSON.parse(localStorage.getItem(RSVP_KEY) || '[]');
    } catch {
        return [];
    }
}

function renderRsvpList() {
    const list = document.getElementById('rsvp-list');
    if (!list) return;
    const rsvps = loadRsvps();
    if (rsvps.length === 0) { list.innerHTML = ''; return; }

    const yesCount = rsvps.filter(r => r.attending === 'yes').length;

    list.innerHTML = `<p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:8px;">
    ${rsvps.length} xác nhận · ${yesCount} tham dự
  </p>` + rsvps.slice(-10).reverse().map(r => `
    <div class="rsvp-card">
      <span class="rsvp-name">${escapeHtml(r.name)}</span>
      <span class="rsvp-status"> — ${r.attending === 'yes' ? '✓ Tham dự' : '✗ Không đến'}</span>
      ${r.guests > 1 ? `<span style="font-size:0.75rem;color:var(--text-muted)"> (${r.guests} người)</span>` : ''}
    </div>
  `).join('');
}

/* ===============================================================
   ADD TO CALENDAR — generates .ics file download
=============================================================== */
function addToCalendar(title, start, end, location) {
    // Format datetime: YYYYMMDDTHHMMSS (local time, no Z for local)
    const fmtICS = iso => iso.replace(/[-:]/g, '').replace('.000', '');

    const ics = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Trung Pham Thu Yen Wedding//VI',
        'BEGIN:VEVENT',
        `DTSTART:${fmtICS(start)}`,
        `DTEND:${fmtICS(end)}`,
        `SUMMARY:${title}`,
        `LOCATION:${location}`,
        `DESCRIPTION:Thiệp cưới online - Trung Phẩm & Thu Yến`,
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dam-cuoi-trung-pham-thu-yen.ics';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('📅 Đã tải sự kiện vào lịch!');
}

/* ===============================================================
   BACKGROUND MUSIC
=============================================================== */
let musicPlaying = false;
const musicBtn = document.getElementById('music-btn');
const bgMusic = document.getElementById('bg-music');

function toggleMusic() {
    if (!bgMusic) return;
    if (musicPlaying) {
        bgMusic.pause();
        musicPlaying = false;
        if (musicBtn) musicBtn.classList.remove('playing');
        showToast('⏸ Nhạc đã tắt');
    } else {
        bgMusic.play().then(() => {
            musicPlaying = true;
            if (musicBtn) musicBtn.classList.add('playing');
        }).catch(() => {
            showToast('🎵 Thêm file nhạc vào thư mục audio/');
        });
    }
}

/* ===============================================================
   TOAST NOTIFICATION
=============================================================== */
function showToast(msg) {
    let toast = document.querySelector('.toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), 3500);
}

/* ===============================================================
   HELPERS
=============================================================== */
function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function formatDate(d) {
    const p = n => String(n).padStart(2, '0');
    return `${p(d.getHours())}:${p(d.getMinutes())} · ${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/* ── Graceful image fallback ─────────────────────────────── */
document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', function () {
        this.style.visibility = 'hidden';
        const parent = this.parentElement;
        if (parent && parent.classList.contains('arch-frame')) {
            parent.style.background = 'linear-gradient(135deg, #fce4ec 0%, #f8bbd0 55%, #fce4ec 100%)';
        }
    });
});

/* ── Page entrance animation ─────────────────────────────── */
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.6s ease';
    requestAnimationFrame(() => { document.body.style.opacity = '1'; });
});

/* ── Auto-play music on first user interaction ───────────── */
// Browsers block autoplay until user interacts with the page.
// Try immediately on load; if blocked, retry on first gesture.
function startMusic() {
    if (!bgMusic || musicPlaying) return;
    bgMusic.play().then(() => {
        musicPlaying = true;
        if (musicBtn) musicBtn.classList.add('playing');
        // Success → remove all retry listeners
        ['click', 'touchstart', 'keydown', 'scroll'].forEach(ev =>
            document.removeEventListener(ev, startMusic)
        );
    }).catch(() => {
        // Failed (blocked or file missing) → keep listeners to retry on next gesture
    });
}

// Try immediately (works on some browsers / return visits)
window.addEventListener('load', () => startMusic());

// Fallback: retry on first user gesture
['click', 'touchstart', 'keydown', 'scroll'].forEach(ev =>
    document.addEventListener(ev, startMusic, { passive: true })
);

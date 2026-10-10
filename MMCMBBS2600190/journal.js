// Stacked journal — renders journal-posts.json as sticky stacking cards.
//
// - Shows the latest 15 entries by default, newest on top.
// - Picking a date re-centers the stack on entries near that date.
// - Tap a card to expand / collapse the full entry.
//
// To post: edit journal-posts.json, add a new object at the TOP
// of the array, save. This file never needs to change.

const WINDOW = 15; // how many cards in one stack view

const stackEl  = document.getElementById('stk-stack');
const noteEl   = document.getElementById('stk-note');
const dateEl   = document.getElementById('stk-date');
const todayBtn = document.getElementById('stk-today');

let allPosts = [];

function escapeHtml(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

function formatDate(iso) {
  const d = new Date(iso + 'T00:00:00');
  if (isNaN(d)) return iso;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function excerptOf(body) {
  const t = body.replace(/\s+/g, ' ').trim();
  return t.length > 160 ? t.slice(0, 160).trimEnd() + '…' : t;
}

function cardHTML(post, i) {
  const rank = allPosts.length - allPosts.indexOf(post); // newest = highest number
  return `
  <article class="stk-card" style="--i:${i}">
    <div class="stk-top">
      <span class="stk-date">${escapeHtml(formatDate(post.date))}</span>
      <span class="stk-num">${rank} / ${allPosts.length}</span>
    </div>
    <h2 class="stk-title">${escapeHtml(post.title)}</h2>
    <p class="stk-excerpt">${escapeHtml(excerptOf(post.body))}</p>
    <div class="stk-full" hidden>${escapeHtml(post.body)}</div>
    <span class="stk-hint">Tap to read</span>
  </article>`;
}

function render(list, note) {
  if (!list.length) {
    stackEl.innerHTML = '';
    noteEl.textContent = note || 'No entries here — try another date.';
    return;
  }
  stackEl.innerHTML = list.map((p, i) => cardHTML(p, i)).join('');
  noteEl.textContent = note || '';
  stackEl.querySelectorAll('.stk-card').forEach((card) => {
    card.addEventListener('click', () => {
      const full = card.querySelector('.stk-full');
      const ex = card.querySelector('.stk-excerpt');
      const hint = card.querySelector('.stk-hint');
      const open = card.classList.toggle('open');
      full.hidden = !open;
      ex.hidden = open;
      hint.textContent = open ? 'Tap to collapse' : 'Tap to read';
    });
  });
}

function showLatest() {
  dateEl.value = '';
  render(
    allPosts.slice(0, WINDOW),
    `Showing the latest ${Math.min(WINDOW, allPosts.length)} ${allPosts.length === 1 ? 'entry' : 'entries'} — older ones are one date-jump away.`
  );
}

async function init() {
  try {
    const res = await fetch('journal-posts.json', { cache: 'no-store' });
    allPosts = (await res.json()).slice().sort((a, b) => new Date(b.date) - new Date(a.date));
  } catch (e) {
    allPosts = [];
  }
  if (!allPosts.length) { render([]); return; }
  dateEl.max = new Date().toISOString().slice(0, 10);
  showLatest();
}

dateEl.addEventListener('change', () => {
  if (!dateEl.value) { showLatest(); return; }
  const t = new Date(dateEl.value + 'T00:00:00').getTime();
  const near = allPosts
    .filter((p) => Math.abs(new Date(p.date + 'T00:00:00').getTime() - t) <= 7 * 864e5)
    .slice(0, WINDOW);
  render(
    near,
    near.length ? `Entries around ${formatDate(dateEl.value)} — tap Latest to come back.` : ''
  );
  document.querySelector('.stk-wrap').scrollIntoView({ behavior: 'smooth' });
});

todayBtn.addEventListener('click', () => {
  showLatest();
  document.querySelector('.stk-wrap').scrollIntoView({ behavior: 'smooth' });
});

init();

const stage = document.querySelector('#stage');
const toggle = document.querySelector('#toggle');
const dates = document.querySelector('#dates');
const dots = [];
const tooltip = document.querySelector('#tooltip');
const title = document.querySelector('#spot-title');
const description = document.querySelector('#description');
const previous = document.querySelector('#previous');
const quiz = document.querySelector('#quiz');
const choices = document.querySelector('#choices');
const feedback = document.querySelector('#quiz-feedback');
const names = {
  desk: 'By the front desk',
  climbing: 'Climbing area',
  cave: 'The cave',
  gym: 'Basement gym',
  yoga: 'Yoga room',
  bathroom: 'Basement bathroom',
};

let data;
let day = 0;
let selectedSpot = null;
let expanded = false;
// Each visit keeps its own unique reveals for this browser session.
const sniffedVisits = new Map();

function formatDate(value, options = { month: 'long', day: 'numeric' }) {
  return new Date(`${value}T12:00:00`).toLocaleDateString('en-US', options);
}

function currentNotes() {
  return data.sample_visits[day].notes;
}

function hideTooltip() {
  tooltip.hidden = true;
  dots.forEach(dot => dot.removeAttribute('aria-describedby'));
}

function setExpanded(value) {
  expanded = value;
  stage.classList.toggle('expanded', value);
  stage.inert = !value;
  toggle.setAttribute('aria-expanded', String(value));
  toggle.setAttribute('aria-label', value ? 'Click to stack the floors' : 'Click to open the floors');
  toggle.querySelector('span').textContent = value ? '↙' : '↗';
  document.querySelector('#view-label').textContent = value
    ? 'take a look around'
    : 'all stacked up';
  hideTooltip();
  resetQuiz();
}

function showSpot(spot) {
  selectedSpot = spot;
  const note = currentNotes()[spot];
  title.textContent = names[spot] || data.locations[spot].area;
  description.textContent = note ? `“${note}”` : 'didn’t write anything down here.';
  document.querySelector('#location-floor').textContent = data.locations[spot].floor;
  previous.hidden = day <= 0;
  if (day > 0) {
    const last = data.sample_visits[day - 1];
    document.querySelector('#previous-date').textContent = `last time · ${formatDate(last.date)}`;
    document.querySelector('#previous-note').textContent = last.notes[spot] || 'didn’t write anything down here.';
  }
}

function resetQuiz() {
  selectedSpot = null;
  quiz.hidden = true;
  choices.replaceChildren();
  feedback.hidden = true;
  feedback.textContent = '';
  previous.hidden = true;
  document.querySelector('#previous-note').textContent = '';
  document.querySelector('#location-floor').textContent = '';
  title.textContent = 'what do you think it smells like?';
  description.textContent = expanded
    ? 'pick a dot and see if you can guess the smell.'
    : 'click to open the map, then pick a dot.';
}

function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function startQuiz(spot) {
  if (!expanded || !currentNotes()[spot]) return;
  hideTooltip();
  resetQuiz();
  selectedSpot = spot;
  title.textContent = names[spot] || data.locations[spot].area;
  document.querySelector('#location-floor').textContent = data.locations[spot].floor;
  description.textContent = 'what do you think it smells like here? take a guess.';
  const answer = currentNotes()[spot];
  const alternatives = [...new Set(Object.values(currentNotes()))].filter(note => note !== answer);
  const options = shuffle([answer, ...shuffle(alternatives).slice(0, 2)]);
  options.forEach(note => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'guess-button';
    button.textContent = note;
    button.addEventListener('click', () => revealNote(note));
    choices.append(button);
  });
  quiz.hidden = false;
  choices.querySelector('button').focus({ preventScroll: true });
}

function revealNote(guess = null) {
  if (!selectedSpot || quiz.hidden) return;
  const answer = currentNotes()[selectedSpot];
  quiz.hidden = true;
  choices.replaceChildren();
  showSpot(selectedSpot);
  feedback.hidden = false;
  feedback.textContent = guess === null
    ? 'here’s what i wrote down.'
    : guess === answer
      ? 'yep, that’s what i noticed too.'
      : 'i got something different — here’s my note.';
  const date = data.sample_visits[day].date;
  if (!sniffedVisits.has(date)) sniffedVisits.set(date, new Set());
  sniffedVisits.get(date).add(selectedSpot);
  updateReceipt();
  description.focus({ preventScroll: true });
}

function showTooltip(dot) {
  if (!expanded) return;
  tooltip.textContent = `${names[dot.dataset.spot] || data.locations[dot.dataset.spot].area} · click to guess`;
  tooltip.hidden = false;
  dot.setAttribute('aria-describedby', 'tooltip');
  const bounds = dot.getBoundingClientRect();
  const box = tooltip.getBoundingClientRect();
  tooltip.style.left = `${Math.max(12, Math.min(bounds.left + bounds.width / 2 - box.width / 2, innerWidth - box.width - 12))}px`;
  const top = bounds.top - box.height - 8;
  tooltip.style.top = `${top > 8 ? top : bounds.bottom + 8}px`;
}

function selectDay(index) {
  day = index;
  hideTooltip();
  dates.querySelectorAll('button').forEach((button, i) => {
    button.setAttribute('aria-pressed', String(i === day));
  });
  document.querySelector('#date-label').textContent = `${formatDate(data.sample_visits[day].date, { month: 'long', day: 'numeric', year: 'numeric' })}`;
  dots.forEach(dot => {
    const key = dot.dataset.spot;
    dot.hidden = !currentNotes()[key];
    const position = data.sample_visits[day].positions?.[key] || data.locations[key].position;
    dot.style.left = `${position[0]}%`;
    dot.style.top = `${position[1]}%`;
  });
  resetQuiz();
  updateReceipt();
}

function receiptEntries() {
  const date = data.sample_visits[day].date;
  return [...(sniffedVisits.get(date) || [])].map(spot => ({
    place: names[spot] || data.locations[spot].area,
    note: currentNotes()[spot],
  }));
}

function updateReceipt() {
  const entries = receiptEntries();
  const remaining = Math.max(0, 3 - entries.length);
  document.querySelector('#receipt-progress').textContent = remaining
    ? `reveal ${remaining} more ${remaining === 1 ? 'dot' : 'different dots'} to get your scent receipt.`
    : 'your receipt is ready. keep exploring to add more.';
  document.querySelector('#receipt').hidden = remaining > 0;
  const list = document.querySelector('#receipt-items');
  list.replaceChildren();
  entries.forEach(entry => {
    const item = document.createElement('li');
    const place = document.createElement('span');
    place.className = 'receipt-place';
    place.textContent = entry.place;
    const note = document.createElement('p');
    note.textContent = entry.note;
    item.append(place, note);
    list.append(item);
  });
  document.querySelector('#receipt-date').textContent = formatDate(data.sample_visits[day].date);
  document.querySelector('#receipt-count').textContent = entries.length;
}

function downloadReceipt() {
  const entries = receiptEntries();
  if (entries.length < 3) return;
  const lines = ['A RECEIPT FOR YOUR NOSE', formatDate(data.sample_visits[day].date), '', 'today you sniffed:', ''];
  const wrap = text => text.match(/.{1,44}(?:\s|$)|\S{1,44}/g)?.map(line => line.trim()) || [];
  entries.forEach((entry, index) => {
    lines.push(...wrap(`${index + 1}. ${entry.place}`), ...wrap(entry.note), '');
  });
  lines.push('--------------------------------------------', `total sniffed: ${entries.length}`, '', 'no refunds.', 'you smelled what you smelled.');
  const escape = text => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  const height = lines.length * 22 + 64;
  const text = lines.map((line, i) => `<text x="28" y="${44 + i * 22}">${escape(line)}</text>`).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="460" height="${height}" viewBox="0 0 460 ${height}"><rect width="460" height="${height}" fill="#fffdf5"/><g fill="#252d30" font-family="monospace" font-size="14">${text}</g></svg>`;
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `scent-receipt-${data.sample_visits[day].date}.svg`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function init() {
  try {
    // Browsers block fetch for file://. The generated copy supports double-click opening.
    data = location.protocol === 'file:'
      ? window.gymObservations
      : await fetch('observations.json').then(response => {
        if (!response.ok) throw new Error('Unable to load observations');
        return response.json();
      });
    if (!data?.sample_visits?.length || !data.locations) {
      throw new Error('Missing observation data');
    }
    // Create every dot from JSON, including multiple points in the same room.
    const floors = {
      entrance: document.querySelector('[data-floor="entrance"]'),
      'climbing level': document.querySelector('[data-floor="climbing"]'),
      basement: document.querySelector('[data-floor="basement"]'),
    };
    Object.entries(data.locations).forEach(([key, point]) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'dot';
      dot.dataset.spot = key;
      dot.setAttribute('aria-label', `Smell at ${point.area}`);
      ['mouseenter', 'focus'].forEach(event => {
        dot.addEventListener(event, () => showTooltip(dot));
      });
      dot.addEventListener('click', () => startQuiz(key));
      dot.addEventListener('mouseleave', hideTooltip);
      dot.addEventListener('blur', hideTooltip);
      floors[point.floor].append(dot);
      dots.push(dot);
    });
    data.sample_visits.sort((a, b) => a.date.localeCompare(b.date));
    document.querySelector('#visit-count').textContent = `${data.sample_visits.length} visits`;
    data.sample_visits.forEach((visit, index) => {
      const button = document.createElement('button');
      button.className = 'date-button';
      button.setAttribute('aria-label', formatDate(visit.date));
      const month = document.createElement('small');
      month.textContent = formatDate(visit.date, { month: 'short' });
      button.append(month, String(Number(visit.date.slice(-2))));
      button.addEventListener('click', () => selectDay(index));
      dates.append(button);
    });
    selectDay(0);
  } catch (error) {
    const status = document.querySelector('#load-status');
    status.hidden = false;
    status.textContent = 'The notes could not load. Check observations.json and run node sync-data.mjs for local-file viewing.';
    toggle.disabled = true;
    console.error(error);
  }
}

toggle.addEventListener('click', () => setExpanded(!expanded));
document.querySelector('#reveal').addEventListener('click', () => revealNote());
document.querySelector('#download-receipt').addEventListener('click', downloadReceipt);
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') hideTooltip();
});
window.addEventListener('resize', hideTooltip);
window.addEventListener('scroll', hideTooltip, true);
const about = document.querySelector('#about');
about.addEventListener('click', () => {
  const panel = document.querySelector('#about-panel');
  panel.hidden = !panel.hidden;
  about.setAttribute('aria-expanded', String(!panel.hidden));
});

setExpanded(false);
init();

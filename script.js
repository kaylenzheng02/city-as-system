// EDIT YOUR NOTES HERE. Add a visit with a real date as its label when you have one.
// Keep the location keys the same. Omit a key if you did not record that location.
const visits = [
  {
    label: 'General notes · undated',
    demo: false,
    notes: {
      desk: 'feet / chalk / sometimes towels',
      cave: 'old books & wood',
      climbing: 'chalk, sometimes lysol?????, soap',
      yoga: 'feet',
      bathroom: 'sometimes vinegar, sweat??????',
      gym: 'soap',
    },
  },
  {
    label: 'Demo visit A · no real date',
    demo: true,
    notes: {
      desk: 'feet / chalk',
      cave: 'old books & wood',
      climbing: 'chalk',
      yoga: 'feet',
      bathroom: 'vinegar????',
      gym: 'soap',
    },
  },
  {
    label: 'Demo visit B · no real date',
    demo: true,
    notes: {
      desk: 'towels today?? and chalk',
      cave: 'old books & wood',
      climbing: 'lysol????? / soap',
      bathroom: 'sweat??????',
      gym: 'soap',
    },
  },
];

const names = {
  desk: 'By the front desk',
  cave: 'The cave',
  climbing: 'Climbing area',
  yoga: 'Yoga room',
  bathroom: 'Basement bathroom',
  gym: 'Basement gym',
};

const stage = document.querySelector('#stage');
const toggle = document.querySelector('#toggle');
const select = document.querySelector('#visit');
const dots = [...document.querySelectorAll('.dot')];

let expanded = false;
let selectedSpot = null;

visits.forEach((visit, index) => {
  const option = document.createElement('option');
  option.value = index;
  option.textContent = visit.label;
  select.append(option);
});

function setExpanded(value) {
  expanded = value;
  stage.classList.toggle('expanded', value);
  toggle.setAttribute('aria-expanded', String(value));
  toggle.textContent = value ? 'Stack the floors ↙' : 'Separate the floors ↗';

  document.querySelector('#instruction').textContent = value
    ? 'Hover or tap a dot to read a note.'
    : 'Click the stack to open it.';

  dots.forEach((dot) => {
    dot.disabled = !value;
  });
}

function showSpot(spot) {
  selectedSpot = spot;
  const visit = visits[Number(select.value)];
  const note = visit.notes[spot];

  document.querySelector('#spot-title').textContent = names[spot];
  document.querySelector('#description').textContent = note
    ? '“' + note + '”'
    : 'No note recorded here.';

  document.querySelector('#note-context').textContent = note
    ? (visit.demo
      ? 'Illustrative demo note · replace with your own dated observation.'
      : 'Your original notes · date not recorded.')
    : 'Missing a note doesn’t mean there was no smell.';

  dots.forEach((dot) => {
    dot.classList.toggle('active', dot.dataset.spot === spot);
  });
}

function updateVisit() {
  const visit = visits[Number(select.value)];

  document.querySelector('#visit-context').textContent = visit.demo
    ? 'Demo only: these visits illustrate the filter. They are not actual dated observations.'
    : 'Your existing observations collected together. Choose a demo visit to try changes between visits.';

  dots.forEach((dot) => {
    dot.classList.toggle('missing', !visit.notes[dot.dataset.spot]);
  });

  if (selectedSpot) {
    showSpot(selectedSpot);
  }
}

toggle.addEventListener('click', () => setExpanded(!expanded));

stage.addEventListener('click', (event) => {
  if (!expanded && event.target.closest('.floor')) {
    setExpanded(true);
  }
});

dots.forEach((dot) => {
  ['mouseenter', 'focus', 'click'].forEach((type) => {
    dot.addEventListener(type, () => {
      if (expanded) {
        showSpot(dot.dataset.spot);
      }
    });
  });
});

select.addEventListener('change', updateVisit);

setExpanded(false);
updateVisit();

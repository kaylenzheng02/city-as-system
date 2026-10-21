// EDIT YOUR NOTES HERE. Add a visit with a real date as its label when you have one.
// Keep location keys the same. Omitted notes hide that location for the day.
// Demo positions are arbitrary [left %, top %], kept fixed when switching days.
const visits = [
  {
    label: 'General notes · undated',
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
    label: 'Day A · demo',
    positions: {
      desk: [31, 46],
      cave: [18, 28],
      climbing: [49, 78],
      yoga: [34, 40],
      bathroom: [76, 25],
      gym: [42, 80],
    },
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
    label: 'Day B · demo',
    positions: {
      desk: [19, 45],
      cave: [30, 36],
      climbing: [23, 74],
      bathroom: [85, 31],
      gym: [72, 77],
    },
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
const dots = document.querySelectorAll('.dot');
const spotTitle = document.querySelector('#spot-title');
const description = document.querySelector('#description');

let expanded = false;

visits.forEach((visit, index) => {
  select.add(new Option(visit.label, index));
});

function setExpanded(value) {
  expanded = value;
  stage.classList.toggle('expanded', value);
  stage.inert = !value;
  toggle.setAttribute('aria-expanded', String(value));
  const label = value ? 'Stack the floors' : 'Open floors side by side';
  toggle.setAttribute('aria-label', 'click to ' + label.toLowerCase());
  toggle.title = label;
}

function showSpot(spot) {
  const visit = visits[Number(select.value)];
  const note = visit.notes[spot];

  spotTitle.textContent = names[spot];
  description.textContent = note
    ? `“${note}”`
    : 'No note recorded here.';
}

function updateVisit() {
  const visit = visits[Number(select.value)];

  dots.forEach((dot) => {
    const spot = dot.dataset.spot;
    const position = visit.positions?.[spot];

    dot.hidden = !visit.notes[spot];
    dot.style.left = position ? `${position[0]}%` : '';
    dot.style.top = position ? `${position[1]}%` : '';
  });

  spotTitle.textContent = 'Explore a little.';
  description.textContent = 'Hover over a dot to read a note.';
}

toggle.addEventListener('click', () => setExpanded(!expanded));

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

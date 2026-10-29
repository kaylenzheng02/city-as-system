# A gym, by smell

A small sensory journal built with HTML, CSS, and JavaScript. Click to unfold
the three floors, choose a visit, and hover, focus, or tap a gray dot to read
its note. The journal also shows the previous visit's note for that location.

## Open

Open `index.html` directly in a browser. No installation is needed.
Google Sans loads online; Arial is the offline fallback.

For a local server, run `python -m http.server 5173 --bind 127.0.0.1`
and open `http://127.0.0.1:5173`.

## Edit the notes

`observations.json` is the source data:

- `locations`: floor, area, and dot position as `[left %, top %]`.
- `undated_notes`: the original observations.
- `sample_visits`: seven illustrative dated visits, each with notes keyed by location.

Keep location keys consistent. Omit a note to hide its dot for that visit.
After editing JSON, run `node sync-data.mjs` to update `observations-data.js`,
the generated copy used when opening the page directly. A server loads JSON directly.

## Files

- `index.html`: page structure and schematic rooms.
- `styles.css`: layout, responsive behavior, and motion.
- `script.js`: date selection, floor toggle, tooltips, and note comparison.

The desktop map unfolds horizontally. On narrow screens it uses a vertical
layout to keep the rooms readable. Reduced-motion preferences are respected.
The closed stack is inert: only the external button can open it.

The room layout is schematic, not a measured floor plan. The dated entries
are generated samples, kept separate from the original undated observations.

## Publish

This is a static site. Upload the HTML, CSS, JS, JSON, and generated data file
together to a static host, preserving their relative paths. No build is required.

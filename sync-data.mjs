// Refresh the local-file copy after editing observations.json.
import { readFileSync, writeFileSync } from 'node:fs';

const source = new URL('./observations.json', import.meta.url);
const data = JSON.parse(readFileSync(source, 'utf8'));
writeFileSync(
  new URL('./observations-data.js', import.meta.url),
  '// Generated from observations.json. Run node sync-data.mjs to refresh.\n' +
  `window.gymObservations = ${JSON.stringify(data, null, 2)};\n`,
);
console.log('Updated local-file data.');

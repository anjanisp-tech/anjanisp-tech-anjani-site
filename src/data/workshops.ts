// Workshops and talks delivered, newest first. Added 2026-10-12.
// To add one: put a new object at the TOP of this list. The Services page
// list and the About page "most recent" line both read from here.
export type Workshop = {
  date: string;      // ISO, e.g. '2026-10-09'
  host: string;      // company or event that hosted it
  city: string;
  title: string;     // the session title as announced
  format: string;    // one plain line: what kind of session
  audience: string;  // one plain line: who was in the room
};

export const workshops: Workshop[] = [
  {
    date: '2026-10-09',
    host: 'GO DESi',
    city: 'Bengaluru',
    title: 'My Experiments with Truth & AI Agents',
    format: 'Fireside chat plus a 20-minute hands-on build',
    audience: 'About 30 people, in the room and on Teams',
  },
];

export const formatWorkshopDate = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

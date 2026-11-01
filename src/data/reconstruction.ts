import type { Scene } from '@/lib/reconstruction'

/**
 * The reconstruction played after the case is closed: a zoom on each scene of
 * the solution, the murder last. Walks are a few steps within the walker's
 * room (tests/unit/reconstruction.test.ts checks it), and walkers stay where
 * they went for the rest of the reconstruction.
 */
export const RECONSTRUCTION: Scene[] = [
  {
    cast: ['antoine'],
    // The Mezzanine alone, rows 1 to 4: Alexandra (C5) stays out of the shot.
    shot: { row: 0, col: 0, size: 4 },
    beats: [{ effects: [{ person: 'antoine', effect: 'zzz' }], ms: 3500 }],
  },
  {
    cast: ['anthony', 'thibault', 'guillaume'],
    // Centered on them, past the map's bottom edge: more yard is drawn there.
    shot: { row: 15, col: 4.5, size: 8 },
    beats: [
      { walk: [{ person: 'anthony', path: ['N19', 'M19', 'L19', 'K19'] }] },
      { say: { person: 'anthony', text: 'Je peux t’en taxer une ?' } },
      { say: { person: 'thibault', text: 'Oui, pas de souci.' } },
      { say: { person: 'guillaume', text: 'T’en as une pour moi aussi ?' } },
      { say: { person: 'thibault', text: 'Ça va les mecs, ça abuse pas un peu ?' } },
    ],
  },
  {
    cast: ['jeremie', 'matthieu', 'guiom'],
    // Guiom seen coming in, from the Dressing's edge.
    frame: ['G13'],
    beats: [
      {
        effects: [
          { person: 'jeremie', effect: 'sway' },
          { person: 'matthieu', effect: 'swayBack' },
        ],
        say: { person: 'jeremie', text: 'Je vais te mettre la misère !' },
      },
      { say: { person: 'matthieu', text: 'Philiiiiiipe !' } },
      { walk: [{ person: 'guiom', path: ['E11', 'F11', 'G11', 'G12'] }] },
      {
        walk: [{ person: 'guiom', path: ['G13', 'G14', 'G15', 'G16'], enters: true }],
        say: { person: 'guiom', text: 'J’arrive, on va l’avoir !' },
      },
    ],
  },
  {
    cast: ['caroline'],
    beats: [{ say: { person: 'caroline', text: 'Y a vraiment personne dans ce bureau…' } }],
  },
  {
    cast: ['benoit'],
    beats: [
      {
        effects: [
          { person: 'benoit', effect: 'blur' },
          { person: 'benoit', effect: 'music' },
        ],
        say: { person: 'benoit', text: 'Papayou, papayou, papayou papayou lélé ♪' },
      },
    ],
  },
  {
    cast: ['sohanne'],
    beats: [{ say: { person: 'sohanne', text: 'Zut, mauvaise porte.' } }],
  },
  {
    cast: ['karen', 'maxime'],
    // Framed where they meet (rows 4 to 10): Karen walks down out of the shot.
    shot: { row: 3.5, col: 14, size: 6 },
    beats: [
      { say: { person: 'karen', text: 'Kisskousss !' } },
      {
        walk: [{ person: 'maxime', path: ['T7', 'T8', 'T9'] }],
        say: { person: 'maxime', text: 'Salut !' },
      },
      { walk: [{ person: 'karen', path: ['S9', 'S10', 'S11', 'S12'] }] },
    ],
  },
  {
    cast: ['adrieng', 'jibe'],
    beats: [
      { say: { person: 'adrieng', text: 'Tu viens au heavy weekend ?' } },
      { say: { person: 'jibe', text: 'Oui. Tu fais les 3 jours aussi ?' } },
      { say: { person: 'adrieng', text: 'J’hésite…' } },
    ],
  },
  {
    cast: ['erwan'],
    beats: [
      { walk: [{ person: 'erwan', path: ['K10', 'J10', 'I10', 'H10'] }] },
      { say: { person: 'erwan', text: 'J’ai entendu comme un appel de Philippe par là…' } },
    ],
  },
  {
    cast: ['julio', 'jerome'],
    beats: [
      { say: { person: 'julio', text: 'Ah, un bon p’tit yaourt pour le goûter !' } },
      { say: { person: 'jerome', text: 'Rien pour moi, merci.' } },
    ],
  },
  {
    cast: ['alexandra'],
    beats: [{ say: { person: 'alexandra', text: 'Tiens, où est François ?' } }],
  },
  {
    cast: ['thiery', 'francois'],
    // The Aquarium from M to R: Thiery in the shot from the start, where he stands.
    shot: { row: 0, col: 11.75, size: 6.5 },
    beats: [
      { say: { person: 'francois', text: 'Non Thiery, que fais-tu ?' } },
      {
        walk: [{ person: 'thiery', path: ['R1', 'Q1', 'P1', 'O1', 'N1'] }],
        say: {
          person: 'thiery',
          text: 'Je ne peux pas m’en empêcher, c’est la hache qui me contrôle !',
        },
      },
      { say: { person: 'francois', text: 'Noooon !' } },
      { say: { person: 'francois', text: 'Nooooon !' } },
      {
        effects: [{ person: 'francois', effect: 'fallen' }],
        say: { person: 'francois', text: 'Arrrg !' },
      },
      { say: { person: 'thiery', text: 'Nooooon !' } },
    ],
  },
]

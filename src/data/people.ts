/**
 * The cast: the active participants of marmelab-en-voyage, whose avatars are
 * copied (160px) into public/avatars/<id>.png.
 */
export interface Person {
  id: string
  name: string
  /** For clues such as "with two women". */
  woman?: boolean
}

export const PEOPLE: Person[] = [
  { id: 'adrieng', name: 'Adrien' },
  { id: 'alexandra', name: 'Alexandra', woman: true },
  { id: 'anthony', name: 'Anthony' },
  { id: 'antoine', name: 'Antoine' },
  { id: 'benoit', name: 'Benoît' },
  { id: 'caroline', name: 'Caroline', woman: true },
  { id: 'erwan', name: 'Erwan' },
  { id: 'francois', name: 'François' },
  { id: 'guillaume', name: 'Guillaume' },
  { id: 'guiom', name: 'Guiom' },
  { id: 'jeremie', name: 'Jérémie' },
  { id: 'jerome', name: 'Jérome' },
  { id: 'jibe', name: 'Jibe' },
  { id: 'julio', name: 'Julio' },
  { id: 'karen', name: 'Karen', woman: true },
  { id: 'matthieu', name: 'Matthieu' },
  { id: 'maxime', name: 'Maxime' },
  { id: 'sohanne', name: 'Sohanne', woman: true },
  { id: 'thibault', name: 'Thibault' },
  { id: 'thiery', name: 'Thiery' },
]

export const WOMEN = PEOPLE.filter((person) => person.woman).map((person) => person.id)

export const VICTIM = 'francois'
export const MURDERER = 'thiery'

export const avatarUrl = (id: string) => `avatars/${id}.png`

/**
 * Each suspect's color for the notes on the map, picked by hand: suspects
 * sharing an initial get clearly different families (red, blue, green,
 * orange for the four A…). Initials are white, but dark on light colors
 * (see inkOn).
 */
const COLORS: Record<string, string> = {
  adrieng: '#d32f2f', // red
  alexandra: '#1565c0', // blue
  anthony: '#2e7d32', // green
  antoine: '#ef6c00', // orange
  benoit: '#00838f', // teal
  caroline: '#ad1457', // magenta
  erwan: '#5e35b1', // violet
  francois: '#6d4c41', // brown
  guillaume: '#283593', // navy
  guiom: '#c49000', // mustard
  jeremie: '#7b1fa2', // purple
  jerome: '#e64a19', // red-orange
  jibe: '#00897b', // emerald
  julio: '#fbc02d', // yellow
  karen: '#c2185b', // pink
  matthieu: '#1b5e20', // dark green
  maxime: '#d84315', // rust
  sohanne: '#0277bd', // sky blue
  thibault: '#558b2f', // olive
  thiery: '#4527a0', // indigo
}
export const colorOf = (id: string) => COLORS[id]!

/** Text color that reads on a suspect's color: dark on light ones (yellow), white otherwise. */
export const inkOn = (id: string) => {
  const hex = colorOf(id).slice(1)
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16))
  return 0.299 * r! + 0.587 * g! + 0.114 * b! > 160 ? '#1b1e26' : '#ffffff'
}

/** First letter of the name, without accent, as shown on the notes. */
export const initialOf = (id: string) =>
  PEOPLE.find((person) => person.id === id)!
    .name.normalize('NFD')
    .charAt(0)
    .toUpperCase()

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

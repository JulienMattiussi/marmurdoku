/**
 * The cast: the active participants of marmelab-en-voyage, whose avatars are
 * copied (160px) into public/avatars/<id>.png.
 */
export interface Person {
  id: string
  name: string
}

export const PEOPLE: Person[] = [
  { id: 'adrieng', name: 'Adrien' },
  { id: 'alexandra', name: 'Alexandra' },
  { id: 'anthony', name: 'Anthony' },
  { id: 'antoine', name: 'Antoine' },
  { id: 'benoit', name: 'Benoît' },
  { id: 'caroline', name: 'Caroline' },
  { id: 'erwan', name: 'Erwan' },
  { id: 'francois', name: 'François' },
  { id: 'guillaume', name: 'Guillaume' },
  { id: 'guiom', name: 'Guiom' },
  { id: 'jeremie', name: 'Jérémie' },
  { id: 'jerome', name: 'Jérome' },
  { id: 'jibe', name: 'Jibe' },
  { id: 'julio', name: 'Julio' },
  { id: 'karen', name: 'Karen' },
  { id: 'matthieu', name: 'Matthieu' },
  { id: 'maxime', name: 'Maxime' },
  { id: 'sohanne', name: 'Sohanne' },
  { id: 'thibault', name: 'Thibault' },
  { id: 'thiery', name: 'Thiery' },
]

export const VICTIM = 'francois'
export const MURDERER = 'thiery'

export const avatarUrl = (id: string) => `avatars/${id}.png`

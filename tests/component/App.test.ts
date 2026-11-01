import { fireEvent, render, screen } from '@testing-library/vue'
import App from '@/App.vue'
import { PEOPLE } from '@/data/people'
import { SOLUTION } from '@/data/solution'

const cell = (container: Element, name: string) => container.querySelector(`[data-cell="${name}"]`)!
const avatarsOnMap = (container: Element) =>
  [...container.querySelectorAll('svg image')].map((image) => image.getAttribute('href'))

describe('App', () => {
  it('opens on the game title', () => {
    render(App)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Marmurdoku')
  })

  it('places the picked person on a clicked cell, and a second click crosses them out', async () => {
    const { container } = render(App)
    const karen = screen.getByRole('button', { name: /^Karen/ })
    await fireEvent.click(karen)
    expect(karen).toHaveAttribute('aria-pressed', 'true')
    await fireEvent.click(cell(container, 'S8'))
    expect(avatarsOnMap(container)).toEqual(['avatars/karen.png'])
    expect(karen).toHaveAttribute('aria-pressed', 'false')
    expect(karen).toHaveTextContent('S8')
    await fireEvent.click(cell(container, 'S8'))
    expect(avatarsOnMap(container)).toEqual([])
    expect(container.querySelectorAll('.cross')).toHaveLength(1)
  })

  it('crosses out a cell when nobody is picked', async () => {
    const { container } = render(App)
    await fireEvent.click(cell(container, 'S8'))
    expect(container.querySelectorAll('.cross')).toHaveLength(1)
    await fireEvent.click(cell(container, 'S8'))
    expect(container.querySelectorAll('.cross')).toHaveLength(0)
  })

  it('takes no click on a cell nobody can stand on', () => {
    const { container } = render(App)
    expect(container.querySelector('[data-cell="A1"]')).toBeNull()
  })
})

describe('Vérifier', () => {
  const placeEveryone = async (container: Element, solution: Record<string, string>) => {
    for (const [id, name] of Object.entries(solution)) {
      const person = PEOPLE.find((p) => p.id === id)!
      await fireEvent.click(screen.getByRole('button', { name: new RegExp(`^${person.name}`) }))
      await fireEvent.click(cell(container, name))
    }
  }

  it('stays greyed out until everyone is on the map', () => {
    render(App)
    expect(screen.getByRole('button', { name: 'Vérifier' })).toBeDisabled()
  })

  it('closes the case on the solution, through the reconstruction', async () => {
    vi.useFakeTimers()
    const { container } = render(App)
    await placeEveryone(container, SOLUTION)
    await fireEvent.click(screen.getByRole('button', { name: 'Vérifier' }))
    expect(screen.getByRole('alert')).toHaveTextContent(
      'La scène du crime correspond aux témoignages',
    )
    await fireEvent.click(screen.getByRole('button', { name: 'Voir la reconstitution' }))
    expect(screen.queryByRole('alert')).toBeNull()
    // After the first zoom: Antoine asleep in his bed.
    await vi.advanceTimersByTimeAsync(2000)
    expect(container.querySelector('.zzz')).not.toBeNull()
    await fireEvent.click(screen.getByRole('button', { name: /^Passer/ }))
    expect(screen.getByRole('alert')).toHaveTextContent('Affaire classée')
    expect(screen.getByRole('alert')).toHaveTextContent('Thiery !')
    vi.useRealTimers()
  })

  it('reopens a closed case when a save is loaded, after the reconstruction', async () => {
    localStorage.clear()
    const { container } = render(App)
    await fireEvent.click(screen.getByRole('button', { name: 'Sauvegardes' }))
    await fireEvent.click(screen.getByRole('button', { name: 'Sauvegarder' }))
    await fireEvent.click(screen.getByRole('button', { name: 'Fermer les sauvegardes' }))
    await placeEveryone(container, SOLUTION)
    await fireEvent.click(screen.getByRole('button', { name: 'Vérifier' }))
    await fireEvent.click(screen.getByRole('button', { name: 'Voir la reconstitution' }))
    await fireEvent.click(screen.getByRole('button', { name: /^Passer/ }))
    await fireEvent.click(screen.getByRole('button', { name: 'Sauvegardes' }))
    await fireEvent.click(screen.getByRole('button', { name: /^Charger/ }))
    await fireEvent.click(screen.getByRole('button', { name: 'Oui' }))
    expect(screen.queryByRole('alert')).toBeNull()
    expect(avatarsOnMap(container)).toHaveLength(0)
    await fireEvent.click(cell(container, 'S8'))
    expect(container.querySelectorAll('.cross')).toHaveLength(1)
  })

  it('names up to three broken rules on a wrong placement, until "OK"', async () => {
    const { container } = render(App)
    await placeEveryone(container, {
      ...SOLUTION,
      francois: SOLUTION.antoine!,
      antoine: SOLUTION.francois!,
    })
    await fireEvent.click(screen.getByRole('button', { name: 'Vérifier' }))
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('Raté !')
    expect(alert).toHaveTextContent('« Antoine était dans le lit »')
    expect(alert.querySelectorAll('li').length).toBeLessThanOrEqual(3)
    await fireEvent.click(screen.getByRole('button', { name: 'OK' }))
    expect(screen.queryByRole('alert')).toBeNull()
  })
})

describe('Règles', () => {
  it('opens the rules in a modal, and closes them', async () => {
    render(App)
    await fireEvent.click(screen.getByRole('button', { name: 'Règles' }))
    expect(screen.getByRole('dialog', { name: 'Règles du jeu' })).toBeInTheDocument()
    await fireEvent.click(screen.getByRole('button', { name: 'Fermer les règles' }))
    expect(screen.queryByRole('dialog')).toBeNull()
  })
})

describe('Tooltip', () => {
  it('names what stands on a cell after a second of hovering', async () => {
    vi.useFakeTimers()
    const { container } = render(App)
    await fireEvent.pointerEnter(cell(container, 'K9'))
    expect(container.querySelector('.tooltip')).toBeNull()
    await vi.advanceTimersByTimeAsync(1000)
    expect(container.querySelector('.tooltip')).toHaveTextContent('Chaise')
    await fireEvent.pointerLeave(cell(container, 'K9'))
    expect(container.querySelector('.tooltip')).toBeNull()
    vi.useRealTimers()
  })
})

describe('Pointed cell', () => {
  it('lights up the row and column under the mouse', async () => {
    const { container } = render(App)
    const pointed = () =>
      [...container.querySelectorAll('.coordinates--pointed text')].map((t) => t.textContent)
    await fireEvent.pointerEnter(cell(container, 'K9'), { pointerType: 'mouse' })
    expect(container.querySelector('.crosshair')).not.toBeNull()
    expect(pointed()).toEqual(['9', '9', 'K', 'K'])
    await fireEvent.pointerLeave(cell(container, 'K9'))
    expect(container.querySelector('.crosshair')).toBeNull()
    expect(pointed()).toEqual([])
  })
})

describe('Tools', () => {
  it('presses the cross with nobody picked, and pressing it drops the pick', async () => {
    render(App)
    const pressed = (name: RegExp) =>
      screen.getByRole('button', { name }).getAttribute('aria-pressed')
    expect(pressed(/^Croix/)).toBe('true')
    await fireEvent.click(screen.getByRole('button', { name: /^Karen/ }))
    expect(pressed(/^Croix/)).toBe('false')
    await fireEvent.click(screen.getByRole('button', { name: /^Croix/ }))
    expect(pressed(/^Croix/)).toBe('true')
    expect(screen.getByRole('button', { name: /^Karen/ })).toHaveAttribute('aria-pressed', 'false')
  })
})

describe('Notes and undo', () => {
  it('notes positions for the picked suspect, undoes and redoes them', async () => {
    const { container } = render(App)
    const notes = () => container.querySelectorAll('.notes .note').length
    await fireEvent.click(screen.getByRole('button', { name: /^Karen/ }))
    await fireEvent.click(screen.getByRole('button', { name: 'Noter' }))
    await fireEvent.click(cell(container, 'S8'))
    await fireEvent.click(cell(container, 'S10'))
    expect(notes()).toBe(2)
    expect(screen.getByRole('button', { name: /^Karen/ })).toHaveTextContent('2 notes')
    await fireEvent.click(screen.getByRole('button', { name: 'Annuler' }))
    expect(notes()).toBe(1)
    await fireEvent.keyDown(window, { key: 'z', ctrlKey: true })
    expect(notes()).toBe(0)
    await fireEvent.click(screen.getByRole('button', { name: 'Refaire' }))
    expect(notes()).toBe(1)
  })
})

describe('Sauvegardes', () => {
  beforeEach(() => localStorage.clear())

  it('saves the grid under a name, loads it back and deletes it, both after a yes', async () => {
    const { container } = render(App)
    await fireEvent.click(cell(container, 'S8'))
    await fireEvent.click(screen.getByRole('button', { name: 'Sauvegardes' }))
    await fireEvent.update(
      screen.getByRole('textbox', { name: 'Nom de la sauvegarde' }),
      'Ma piste',
    )
    await fireEvent.click(screen.getByRole('button', { name: 'Sauvegarder' }))
    expect(screen.getByText('Ma piste')).toBeInTheDocument()
    await fireEvent.click(screen.getByRole('button', { name: 'Fermer les sauvegardes' }))

    await fireEvent.click(cell(container, 'S8'))
    expect(container.querySelectorAll('.cross')).toHaveLength(0)
    await fireEvent.click(screen.getByRole('button', { name: 'Sauvegardes' }))
    await fireEvent.click(screen.getByRole('button', { name: 'Charger Ma piste' }))
    await fireEvent.click(screen.getByRole('button', { name: 'Non' }))
    expect(container.querySelectorAll('.cross')).toHaveLength(0)
    await fireEvent.click(screen.getByRole('button', { name: 'Charger Ma piste' }))
    await fireEvent.click(screen.getByRole('button', { name: 'Oui' }))
    expect(container.querySelectorAll('.cross')).toHaveLength(1)

    await fireEvent.click(screen.getByRole('button', { name: 'Sauvegardes' }))
    await fireEvent.click(screen.getByRole('button', { name: 'Supprimer Ma piste' }))
    expect(screen.getByText('Ma piste')).toBeInTheDocument()
    await fireEvent.click(screen.getByRole('button', { name: 'Oui' }))
    expect(screen.getByText('Aucune sauvegarde pour l’instant.')).toBeInTheDocument()
  })
})

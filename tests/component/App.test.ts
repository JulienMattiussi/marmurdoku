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
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Marmerdoku')
  })

  it('places the picked person on a clicked cell, and empties it on a second click', async () => {
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

  it('closes the case on the solution', async () => {
    const { container } = render(App)
    await placeEveryone(container, SOLUTION)
    await fireEvent.click(screen.getByRole('button', { name: 'Vérifier' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Affaire classée')
  })

  it('shows a short-lived "Raté !" on a wrong placement', async () => {
    vi.useFakeTimers()
    const { container } = render(App)
    await placeEveryone(container, {
      ...SOLUTION,
      francois: SOLUTION.antoine!,
      antoine: SOLUTION.francois!,
    })
    await fireEvent.click(screen.getByRole('button', { name: 'Vérifier' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Raté !')
    await vi.runAllTimersAsync()
    expect(screen.queryByRole('alert')).toBeNull()
    vi.useRealTimers()
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

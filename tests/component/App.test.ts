import { fireEvent, render, screen } from '@testing-library/vue'
import App from '@/App.vue'

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
    const karen = screen.getByRole('button', { name: /Karen/ })
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

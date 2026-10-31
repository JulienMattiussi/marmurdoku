import { render, screen } from '@testing-library/vue'
import App from '@/App.vue'

describe('App', () => {
  it('opens on the game title', () => {
    render(App)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Marmerdoku')
  })
})

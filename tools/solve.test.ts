import { PEOPLE } from '@/data/people'
import { cellName } from '@/lib/geometry'
import { solve } from '@/lib/solver'
import { PUZZLE, SOLUTION_PLACEMENTS } from '@/puzzle'

/**
 * `make solve`: tells whether the clues lead to a single solution. When they
 * do not, prints two solutions and who stands elsewhere from one to the
 * other, to know which clue to add. Not part of `make test`.
 */
it('reports how many solutions the clues allow', () => {
  const start = performance.now()
  const found = solve(PUZZLE, 2)
  const time = Math.round(performance.now() - start)
  const name = (id: string) => PEOPLE.find((person) => person.id === id)!.name
  const lines = [
    `${found.length >= 2 ? 'Au moins 2 solutions' : `${found.length} solution`} (${time} ms)`,
  ]
  const [first, second] = found
  if (first && second) {
    const moved = PEOPLE.filter(({ id }) => cellName(first[id]!) !== cellName(second[id]!))
    lines.push('Personnes qui changent de place entre les deux :')
    for (const { id } of moved) {
      lines.push(`  ${name(id)} : ${cellName(first[id]!)} ou ${cellName(second[id]!)}`)
    }
  }
  if (first) {
    const differs = PEOPLE.filter(
      ({ id }) => cellName(first[id]!) !== cellName(SOLUTION_PLACEMENTS[id]!),
    )
    lines.push(
      differs.length
        ? `Écarts avec data/solution.ts : ${differs.map(({ id }) => `${name(id)} ${cellName(first[id]!)}`).join(', ')}`
        : 'La première solution est celle de data/solution.ts.',
    )
  }
  console.log(lines.join('\n'))
}, 120000)

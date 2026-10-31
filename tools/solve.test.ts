import { PEOPLE } from '@/data/people'
import { cellName } from '@/lib/geometry'
import { solve } from '@/lib/solver'
import { PUZZLE, SOLUTION_PLACEMENTS } from '@/puzzle'

/**
 * `make solve`: tells whether the clues single out data/solution.ts. If another
 * placement also fits every clue, prints who stands elsewhere in it, compared
 * with data/solution.ts, to know which clue to add. Not part of `make test`.
 */
it('reports whether the clues lead to data/solution.ts only', () => {
  const start = performance.now()
  const found = solve(PUZZLE, 2)
  const time = Math.round(performance.now() - start)
  const same = (placements: (typeof found)[number]) =>
    PEOPLE.every(({ id }) => cellName(placements[id]!) === cellName(SOLUTION_PLACEMENTS[id]!))
  const other = found.find((placements) => !same(placements))
  const lines: string[] = []
  if (!other) {
    lines.push(`Solution unique : c'est celle de data/solution.ts (${time} ms)`)
  } else {
    lines.push(`Une autre solution respecte tous les indices (${time} ms).`)
    lines.push('Par rapport à data/solution.ts, elle place :')
    for (const { id, name } of PEOPLE) {
      const theirs = cellName(other[id]!)
      const ours = cellName(SOLUTION_PLACEMENTS[id]!)
      if (theirs !== ours) lines.push(`  ${name} en ${theirs} (au lieu de ${ours})`)
    }
  }
  console.log(lines.join('\n'))
}, 120000)

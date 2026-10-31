import { PEOPLE } from '@/data/people'
import { analyze, rounds } from '@/lib/difficulty'
import { cellName } from '@/lib/geometry'
import { solve, type Puzzle } from '@/lib/solver'
import { PUZZLE, SOLUTION_PLACEMENTS } from '@/puzzle'

/**
 * `make solve`: tells whether the clues single out data/solution.ts. If another
 * placement also fits every clue, prints who stands elsewhere in it, compared
 * with data/solution.ts, to know which clue to add. When the solution is
 * unique, removes each rule in turn: a rule whose removal leaves the solution
 * unique is not needed. Not part of `make test`.
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

/** Every single rule of the puzzle, and the puzzle without it. */
const withoutEachRule = (puzzle: Puzzle) => [
  ...Object.entries(puzzle.clues).flatMap(([person, clues]) =>
    clues.flatMap((clue, c) =>
      clue.rules.map((rule, r) => ({
        label: `${person} : « ${clue.text} » (${rule.type})`,
        puzzle: {
          ...puzzle,
          clues: {
            ...puzzle.clues,
            [person]: clues.map((other, o) =>
              o === c ? { ...other, rules: other.rules.filter((_, i) => i !== r) } : other,
            ),
          },
        },
      })),
    ),
  ),
  ...puzzle.general.flatMap((clue, c) =>
    clue.rules.map((rule, r) => ({
      label: `« ${clue.text} » (${rule.type})`,
      puzzle: {
        ...puzzle,
        general: puzzle.general.map((other, o) =>
          o === c ? { ...other, rules: other.rules.filter((_, i) => i !== r) } : other,
        ),
      },
    })),
  ),
]

it('reports the rules that are not needed', () => {
  if (solve(PUZZLE, 2).length !== 1) return
  const useless = withoutEachRule(PUZZLE).filter(({ puzzle }) => solve(puzzle, 2).length === 1)
  console.log(
    useless.length
      ? `Règles superflues (la solution reste unique sans elles) :\n${useless.map(({ label }) => `  ${label}`).join('\n')}`
      : 'Aucune règle superflue : chacune est nécessaire.',
  )
}, 300000)

it('measures how far a person gets by plain reading', () => {
  const start = performance.now()
  const { steps, open, consistent } = analyze(PUZZLE)
  const name = (id: string) => PEOPLE.find((person) => person.id === id)!.name
  const lines = [
    `Lecture simple (${Math.round(performance.now() - start)} ms) : ${PUZZLE.people.length - open.size}/${PUZZLE.people.length} suspects placés sans rien essayer`,
    ...steps.map((step) => `  · ${step}`),
  ]
  if (!consistent) lines.push('  Contradiction : les indices se contredisent.')
  if (open.size) {
    lines.push('  Bloqué ; cases encore possibles :')
    for (const [id, cells] of [...open].sort((a, b) => a[1].length - b[1].length)) {
      lines.push(`    ${name(id)} (${cells.length}) : ${cells.map(cellName).join(' ')}`)
    }
  }
  console.log(lines.join('\n'))
}, 300000)

it('tracks how many cells stay open, placement after placement', () => {
  const start = performance.now()
  const played = rounds(PUZZLE, SOLUTION_PLACEMENTS)
  const name = (id: string) => PEOPLE.find((person) => person.id === id)!.name
  const median = (values: number[]) => {
    const sorted = [...values].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    return sorted.length % 2 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2
  }
  const lines = [
    `Évolution, placement par placement (${Math.round(performance.now() - start)} ms) :`,
  ]
  lines.push('  n°  placé          case   min  médiane  max  total')
  played.forEach(({ person, cell, counts }, i) => {
    const total = counts.reduce((a, b) => a + b, 0)
    lines.push(
      `  ${String(i + 1).padStart(2)}  ${name(person).padEnd(13)}  ${cellName(cell).padEnd(5)}  ${String(Math.min(...counts)).padStart(3)}  ${String(median(counts)).padStart(7)}  ${String(Math.max(...counts)).padStart(3)}  ${String(total).padStart(5)}`,
    )
  })
  const forced = played.filter(({ counts }) => Math.min(...counts) === 1).length
  lines.push(
    `  Placements évidents (une seule case pour le plus contraint) : ${forced}/${played.length}`,
  )
  // Bits of choice at each round: log2 of the open cells of the most constrained suspect.
  const bits = played.map(({ counts }) => Math.log2(Math.min(...counts)))
  const third = Math.ceil(bits.length / 3)
  const phase = (from: number, to: number) =>
    (bits.slice(from, to).reduce((a, b) => a + b, 0) / (to - from)).toFixed(2)
  lines.push(
    `  Ouverture (somme des log2 du min) : ${bits.reduce((a, b) => a + b, 0).toFixed(1)} bits ; ` +
      `par tiers : début ${phase(0, third)}, milieu ${phase(third, 2 * third)}, fin ${phase(2 * third, bits.length)}`,
  )
  console.log(lines.join('\n'))
}, 300000)

import { distanceTo, isAwayFromWalls, isInCorner, isNear, type Board } from '@/lib/board'
import type { FurnitureKind } from '@/lib/furniture'
import type { Cell, FloorKind, Zone } from '@/lib/grid'

/** A rule about one person, the subject of the clue. Rows and columns count from 0. */
export type PersonRule =
  | { type: 'inZone'; zones: string[] }
  /** "Either… or…": at least one of these rules holds. */
  | { type: 'anyOf'; rules: PersonRule[] }
  | { type: 'notInZone'; zones: string[] }
  /** Standing on one of these floors ("on carpet"). */
  | { type: 'onFloor'; floors: FloorKind[] }
  | { type: 'onFurniture'; kinds: FurnitureKind[] }
  | { type: 'notOnFurniture'; kinds: FurnitureKind[] }
  | { type: 'nearFurniture'; kinds: FurnitureKind[] }
  | { type: 'notNearFurniture'; kinds: FurnitureKind[] }
  | { type: 'alone' }
  | { type: 'notAlone' }
  /** Shares the room with exactly `count` other people, all of them in `among`. */
  | { type: 'roomWith'; count: number; among: string[] }
  | { type: 'sameZoneAs'; person: string }
  | { type: 'columnGap'; person: string; gap: number }
  /** On a row above this person's (closer to row 1); exactly `rows` above if given. */
  | { type: 'above'; person: string; rows?: number }
  | { type: 'inCorner' }
  /**
   * Farther than (or closer than) this person from the closest of these kinds,
   * as the crow flies, or in rows only with `rowsOnly` ("on a row closer to…").
   */
  | {
      type: 'fartherThan' | 'closerThan'
      kinds: FurnitureKind[]
      person: string
      rowsOnly?: boolean
    }
  | { type: 'awayFromWalls' }
  | { type: 'inRows'; rows: number[] }
  | { type: 'inColumns'; cols: number[] }

/** A rule about everybody at once. */
export type GlobalRule =
  | { type: 'nearCount'; kinds: FurnitureKind[]; count: number }
  | { type: 'emptyZones'; count: number }
  /** Exactly `count` people in this room. */
  | { type: 'zoneCount'; zone: string; count: number }
  /** A clue about one person, told without naming them ("the boss…"). */
  | { type: 'person'; person: string; rule: PersonRule }

/** One sentence shown to the player, and the rules it stands for (all must hold). */
export interface Clue<R> {
  text: string
  rules: R[]
  /**
   * For a clue telling several things: the text of each rule, in the order of
   * `rules`, so that a failed check names only the part that does not hold.
   */
  parts?: string[]
}

/** Who stands where; people not placed yet are missing. */
export type Placements = Record<string, Cell>

/**
 * ok: the rule holds and nothing left to place can break it; broken: it can
 * no longer hold; open: it depends on people not placed yet.
 */
export type RuleStatus = 'ok' | 'broken' | 'open'

const verdict = (holds: boolean): RuleStatus => (holds ? 'ok' : 'broken')

const zoneAt = (board: Board, { row, col }: Cell) => board.zones[row]![col]!

const others = (placements: Placements, person: string) =>
  Object.entries(placements).filter(([id]) => id !== person)

const sharesZone = (board: Board, placements: Placements, person: string, zone: Zone) =>
  others(placements, person).some(([, cell]) => zoneAt(board, cell) === zone)

export const personRuleStatus = (
  rule: PersonRule,
  person: string,
  placements: Placements,
  board: Board,
  everyone: string[],
): RuleStatus => {
  const cell = placements[person]
  if (!cell) return 'open'
  const complete = everyone.every((id) => placements[id])
  const kinds = board.kinds[cell.row]![cell.col]!
  switch (rule.type) {
    case 'anyOf': {
      const statuses = rule.rules.map((r) =>
        personRuleStatus(r, person, placements, board, everyone),
      )
      if (statuses.includes('ok')) return 'ok'
      return statuses.every((s) => s === 'broken') ? 'broken' : 'open'
    }
    case 'inZone':
      return verdict(rule.zones.includes(zoneAt(board, cell).id))
    case 'onFloor':
      return verdict(rule.floors.includes(zoneAt(board, cell).floor))
    case 'notInZone':
      return verdict(!rule.zones.includes(zoneAt(board, cell).id))
    case 'onFurniture':
      return verdict(kinds.some((kind) => rule.kinds.includes(kind)))
    case 'notOnFurniture':
      return verdict(!kinds.some((kind) => rule.kinds.includes(kind)))
    case 'nearFurniture':
      return verdict(isNear(board, cell, rule.kinds))
    case 'notNearFurniture':
      return verdict(!isNear(board, cell, rule.kinds))
    case 'alone':
      if (sharesZone(board, placements, person, zoneAt(board, cell))) return 'broken'
      return complete ? 'ok' : 'open'
    case 'notAlone':
      if (sharesZone(board, placements, person, zoneAt(board, cell))) return 'ok'
      return complete ? 'broken' : 'open'
    case 'roomWith': {
      const zone = zoneAt(board, cell)
      const company = others(placements, person).filter(([, c]) => zoneAt(board, c) === zone)
      if (company.length > rule.count) return 'broken'
      if (company.some(([id]) => !rule.among.includes(id))) return 'broken'
      return complete ? verdict(company.length === rule.count) : 'open'
    }
    case 'sameZoneAs': {
      const other = placements[rule.person]
      return other ? verdict(zoneAt(board, other) === zoneAt(board, cell)) : 'open'
    }
    case 'columnGap': {
      const other = placements[rule.person]
      return other ? verdict(Math.abs(other.col - cell.col) === rule.gap) : 'open'
    }
    case 'above': {
      const other = placements[rule.person]
      if (!other) return 'open'
      return verdict(rule.rows ? other.row - cell.row === rule.rows : cell.row < other.row)
    }
    case 'awayFromWalls':
      return verdict(isAwayFromWalls(board, cell))
    case 'fartherThan':
    case 'closerThan': {
      const other = placements[rule.person]
      if (!other) return 'open'
      const mine = distanceTo(board, cell, rule.kinds, rule.rowsOnly)
      const theirs = distanceTo(board, other, rule.kinds, rule.rowsOnly)
      return verdict(rule.type === 'fartherThan' ? mine > theirs : mine < theirs)
    }
    case 'inCorner':
      return verdict(isInCorner(board, cell))
    case 'inRows':
      return verdict(rule.rows.includes(cell.row))
    case 'inColumns':
      return verdict(rule.cols.includes(cell.col))
  }
}

export const globalRuleStatus = (
  rule: GlobalRule,
  placements: Placements,
  board: Board,
  everyone: string[],
): RuleStatus => {
  const placed = Object.values(placements)
  const complete = everyone.every((id) => placements[id])
  switch (rule.type) {
    case 'nearCount': {
      const near = placed.filter((cell) => isNear(board, cell, rule.kinds)).length
      if (near > rule.count) return 'broken'
      return complete ? verdict(near === rule.count) : 'open'
    }
    case 'zoneCount': {
      const inside = placed.filter((cell) => zoneAt(board, cell).id === rule.zone).length
      if (inside > rule.count) return 'broken'
      return complete ? verdict(inside === rule.count) : 'open'
    }
    case 'person':
      return personRuleStatus(rule.rule, rule.person, placements, board, everyone)
    case 'emptyZones': {
      const all = new Set(board.zones.flat().filter((zone) => zone))
      const occupied = new Set(placed.map((cell) => zoneAt(board, cell)))
      const empty = all.size - occupied.size
      if (empty < rule.count) return 'broken'
      return complete ? verdict(empty === rule.count) : 'open'
    }
  }
}

/** The murder as the rules tell it to the player, and as a failed check names it. */
export const CRIME_SCENE_TEXT = 'Le coupable était seul dans une zone avec la victime'

/**
 * The murder, as the player knows it: "the culprit was alone in a zone with
 * the victim", so at least one zone holds exactly two people. Who the victim
 * and the culprit are is never used: the player does not know it.
 */
export const crimeSceneStatus = (
  placements: Placements,
  board: Board,
  everyone: string[],
): RuleStatus => {
  if (!everyone.every((id) => placements[id])) return 'open'
  const counts = new Map<Zone, number>()
  for (const cell of Object.values(placements)) {
    const zone = zoneAt(board, cell)
    counts.set(zone, (counts.get(zone) ?? 0) + 1)
  }
  return verdict([...counts.values()].includes(2))
}

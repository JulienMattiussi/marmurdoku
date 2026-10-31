import { distanceTo, isAwayFromWalls, isInCorner, isNear, type Board } from '@/lib/board'
import type { FurnitureKind } from '@/lib/furniture'
import type { Cell, Zone } from '@/lib/grid'

/** A rule about one person, the subject of the clue. Rows and columns count from 0. */
export type PersonRule =
  | { type: 'inZone'; zones: string[] }
  | { type: 'notInZone'; zones: string[] }
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
  /** Farther than this person from the closest of these kinds, as the crow flies. */
  | { type: 'fartherThan'; kinds: FurnitureKind[]; person: string }
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
    case 'inZone':
      return verdict(rule.zones.includes(zoneAt(board, cell).id))
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
    case 'fartherThan': {
      const other = placements[rule.person]
      if (!other) return 'open'
      return verdict(distanceTo(board, cell, rule.kinds) > distanceTo(board, other, rule.kinds))
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

/** The murder itself: the murderer is the only person with the victim. */
export const murderStatus = (
  victim: string,
  murderer: string,
  placements: Placements,
  board: Board,
  everyone: string[],
): RuleStatus => {
  const victimCell = placements[victim]
  const murdererCell = placements[murderer]
  if (victimCell && murdererCell && zoneAt(board, victimCell) !== zoneAt(board, murdererCell)) {
    return 'broken'
  }
  const crimeScene = victimCell ?? murdererCell
  if (!crimeScene) return 'open'
  const zone = zoneAt(board, crimeScene)
  const witness = Object.entries(placements).some(
    ([id, cell]) => id !== victim && id !== murderer && zoneAt(board, cell) === zone,
  )
  if (witness) return 'broken'
  return everyone.every((id) => placements[id]) ? 'ok' : 'open'
}

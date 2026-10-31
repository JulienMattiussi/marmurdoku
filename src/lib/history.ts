/**
 * Undo / redo over immutable states: every recorded move pushes the previous
 * state on `past` and clears `future`. A move that changes nothing records
 * nothing.
 */
export interface History<T> {
  past: T[]
  present: T
  future: T[]
}

export const startHistory = <T>(present: T): History<T> => ({ past: [], present, future: [] })

export const record = <T>(history: History<T>, next: T): History<T> =>
  next === history.present || JSON.stringify(next) === JSON.stringify(history.present)
    ? history
    : { past: [...history.past, history.present], present: next, future: [] }

export const undo = <T>(history: History<T>): History<T> => {
  const previous = history.past.at(-1)
  if (previous === undefined) return history
  return {
    past: history.past.slice(0, -1),
    present: previous,
    future: [history.present, ...history.future],
  }
}

export const redo = <T>(history: History<T>): History<T> => {
  const [next, ...rest] = history.future
  if (next === undefined) return history
  return { past: [...history.past, history.present], present: next, future: rest }
}

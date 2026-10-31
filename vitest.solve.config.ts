import { defineConfig } from 'vitest/config'
import base from './vitest.config.ts'

/** `make solve` only: runs tools/solve.test.ts, kept out of the regular test suite. */
export default defineConfig({
  ...base,
  test: { ...base.test, include: ['tools/solve.test.ts'], setupFiles: [], silent: false },
})

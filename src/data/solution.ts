/**
 * Where everyone stands, in map coordinates (column letter, row number). One
 * person per row and per column, on placeable cells; François and Thiery are
 * alone together in the Aquarium. Checked by tests/unit/solution.test.ts.
 */
export const SOLUTION: Record<string, string> = {
  thiery: 'R2',
  francois: 'M1',
  antoine: 'A3', // in the bed
  adrieng: 'Q4',
  alexandra: 'C5',
  maxime: 'T6',
  jibe: 'O7',
  karen: 'S8',
  caroline: 'K9',
  erwan: 'J10',
  guiom: 'D11',
  julio: 'I12', // at the kitchen sink
  jerome: 'H13',
  benoit: 'B14', // in the shower
  jeremie: 'E15', // at the foosball table
  sohanne: 'P16',
  matthieu: 'F17', // at the foosball table
  anthony: 'N18',
  thibault: 'L19',
  guillaume: 'G20', // by the cars
}

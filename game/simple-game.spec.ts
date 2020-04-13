import { validate } from "./validate-game";
import { generateFull } from "./simple-game";

describe('generateFull', () => {

  it.each([4, 6, 8, 10])('%p', size => {

    expect(validate(generateFull(size))).toBe(true);
  });
});
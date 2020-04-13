import { validateEquilibrium, validateEquality, validateSequence, listToMatrix, transpose, validate } from './validate-game';

describe('verifyEquilibrium', () => {

  it.each([
    {
      tiles: [
        [0, 0, 1, 1],
        [0, 0, 1, 1],
        [0, 0, 1, 1],
        [0, 0, 1, 1]
      ],
      result: true
    },
    {
      tiles: [
        [0, 0, 2, 2],
        [0, 0, 2, 2],
        [0, 0, 2, 2],
        [0, 0, 2, 2]
      ],
      result: true
    },
    {
      tiles: [
        [2, 2, 2, 2],
        [2, 2, 2, 2],
        [2, 2, 2, 2],
        [2, 2, 2, 2]
      ],
      result: false
    },
    {
      tiles: [
        [2, 2, 2, 2],
        [2, 2, 1, 2],
        [2, 2, 2, 2],
        [1, 2, 2, 2]
      ],
      result: false
    },
    {
      tiles: [
        [2, 2, 2, 2],
        [2, 2, 1, 2],
        [2, 2, 2, 2],
        [1, 2, 2, 2]
      ],
      result: false
    },
    {
      tiles: [
        [0, 0, 1, 0],
        [0, 0, 0, 2],
        [2, 0, 0, 0],
        [1, 1, 0, 0]
      ],
      result: true
    }
  ])('%p', (data) => {

    expect(validateEquilibrium(data.tiles)).toBe(data.result);
  });
});

describe('verifyEquality', () => {

  it.each([
    {
      tiles: [
        [0, 0, 1, 1],
        [0, 0, 1, 1],
        [0, 0, 1, 1],
        [0, 0, 1, 1]
      ],
      result: true
    },
    {
      tiles: [
        [2, 2, 2, 2],
        [2, 2, 2, 2],
        [2, 2, 2, 2],
        [2, 2, 2, 2],
      ],
      result: false
    },
    {
      tiles: [
        [2, 0, 0, 1],
        [2, 1, 2, 1],
        [1, 2, 1, 2],
        [2, 0, 0, 1],
      ],
      result: true
    },
  ])('%p', (data) => {

    expect(validateEquality(data.tiles)).toBe(data.result);
  });
});

describe('validateSequence', () => {

  it.each([
    {
      tiles: [
        [0, 0, 1, 1],
        [0, 0, 1, 1],
        [0, 0, 1, 1],
        [0, 0, 1, 1]
      ],
      result: true
    },
    {
      tiles: [
        [2, 2, 2, 2],
        [2, 2, 2, 2],
        [2, 2, 2, 2],
        [2, 2, 2, 2],
      ],
      result: false
    },
    {
      tiles: [
        [2, 0, 0, 1],
        [2, 1, 2, 1],
        [1, 2, 1, 2],
        [2, 0, 0, 1],
      ],
      result: true
    },
    {
      tiles: [
        [2, 0, 2, 2],
        [2, 1, 2, 1],
        [1, 2, 1, 2],
        [2, 0, 0, 1],
      ],
      result: true
    }, {
      tiles: [
        [2, 0, 2, 2],
        [2, 2, 2, 1],
        [1, 2, 1, 2],
        [2, 0, 0, 1],
      ],
      result: false
    },
    {
      tiles: [
        [2, 0, 1, 2],
        [2, 1, 2, 1],
        [1, 2, 1, 2],
        [2, 1, 1, 1],
      ],
      result: false
    },
  ])('%p', (data) => {

    expect(validateSequence(data.tiles)).toBe(data.result);
  });
});

describe('listToMatrix', () => {

  it.each([
    {
      line: [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1],
      tiles: [
        [0, 0, 1, 1],
        [0, 0, 1, 1],
        [0, 0, 1, 1],
        [0, 0, 1, 1]
      ],
    },
    {
      tiles: [
        [2, 2, 2, 2],
        [2, 2, 2, 2],
        [2, 2, 2, 2],
        [2, 2, 2, 2],
      ],
      line: [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]
    },
    {
      tiles: [
        [2, 0, 0, 1],
        [2, 1, 2, 1],
        [1, 2, 1, 2],
        [2, 0, 0, 1],
      ],
      line: [2, 0, 0, 1, 2, 1, 2, 1, 1, 2, 1, 2, 2, 0, 0, 1]
    },
    {
      tiles: [
        [2, 0, 2, 2],
        [2, 1, 2, 1],
        [1, 2, 1, 2],
        [2, 0, 0, 1],
      ],
      line: [2, 0, 2, 2, 2, 1, 2, 1, 1, 2, 1, 2, 2, 0, 0, 1]
    }, {
      tiles: [
        [2, 0, 2, 2],
        [2, 2, 2, 1],
        [1, 2, 1, 2],
        [2, 0, 0, 1],
      ],
      line: [2, 0, 2, 2, 2, 2, 2, 1, 1, 2, 1, 2, 2, 0, 0, 1]
    },
    {
      tiles: [
        [2, 0, 1, 2],
        [2, 1, 2, 1],
        [1, 2, 1, 2],
        [2, 1, 1, 1],
      ],
      line: [2, 0, 1, 2, 2, 1, 2, 1, 1, 2, 1, 2, 2, 1, 1, 1]
    },
  ])('%p', (data) => {

    expect(listToMatrix(data.line)).toEqual(data.tiles);
  });
});

describe('transpose', () => {

  it.each([
    {
      original: [
        [2, 2, 2, 2],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [1, 1, 1, 1],
      ],
      transposed: [
        [2, 1, 0, 1],
        [2, 1, 0, 1],
        [2, 1, 0, 1],
        [2, 1, 0, 1]
      ]
    },
    {
      original: [
        [2, 1, 0, 0],
        [0, 0, 1, 2],
        [2, 1, 0, 0],
        [0, 0, 1, 2],
      ],
      transposed: [
        [2, 0, 2, 0],
        [1, 0, 1, 0],
        [0, 1, 0, 1],
        [0, 2, 0, 2]
      ]
    },
  ])('%p', (data) => {

    expect(transpose(data.original)).toEqual(data.transposed);
  });
});

describe.only('validate', () => {

  it.each([
    {
      tiles: [
        2, 1, 2, 1,
        1, 2, 1, 2,
        2, 1, 2, 1,
        1, 2, 1, 1,
      ],
      result: false
    },
    {
      tiles: [
        0, 0, 2, 2,
        0, 0, 2, 0,
        0, 0, 0, 0,
        0, 1, 0, 0
      ],
      result: true
    },
    {
      tiles: [
        1, 2, 2, 1,
        2, 1, 1, 2,
        2, 2, 1, 1,
        1, 1, 2, 2
      ],
      result: true,
    },
    {
      tiles: [
        1, 2, 2, 1,
        2, 2, 1, 2,
        2, 2, 1, 1,
        1, 1, 2, 2
      ],
      result: false,
    },
    {
      tiles: [
        2, 2, 1, 1,
        0, 2, 2, 0,
        2, 2, 1, 1,
        0, 1, 0, 0
      ],
      result: false,
    }
  ])('%p', (data) => {

    expect(validate(data.tiles)).toBe(data.result);
  });
});
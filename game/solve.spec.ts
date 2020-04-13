import { tileCanBeSolved } from "./solve"

describe('tileCanBeSolved', () => {

  it.each([
    {
      state: [0, 2, 0, 0, 0, 0, 1, 0, 2, 0, 0, 1, 2, 0, 0, 0],
      position: 0,
      result: true
    },
    {
      state: [0, 2, 0, 0, 0, 0, 1, 0, 2, 0, 0, 1, 2, 0, 0, 0],
      position: 4,
      result: true
    },
    {
      state: [0, 2, 0, 0, 0, 0, 1, 0, 2, 0, 0, 1, 2, 0, 0, 0],
      position: 5,
      result: false
    },
    {
      state: [1, 2, 0, 0, 1, 0, 1, 0, 2, 0, 0, 1, 2, 0, 0, 0],
      position: 5,
      result: true
    },
    {
      state: [1, 2, 0, 0, 1, 2, 1, 2, 2, 0, 0, 1, 2, 0, 0, 0],
      position: 9,
      result: true
    },
    {
      state: [1, 2, 0, 0, 1, 2, 1, 2, 2, 1, 0, 1, 2, 1, 0, 0],
      position: 10,
      result: true
    },
    {
      state: [1, 2, 0, 0, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1, 0, 0],
      position: 2,
      result: true
    },
    {
      state: [1, 2, 0, 0, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1, 0, 0],
      position: 14,
      result: true
    },
    {
      state: [1, 2, 0, 0, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1, 0, 0],
      position: 15,
      result: true
    },
    {
      state: [1, 2, 2, 0, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1, 0, 0],
      position: 3,
      result: true
    },
    {
      state: [0, 1, 0, 2, 2, 2, 1, 1, 0, 2, 0, 1, 0, 0, 0, 2],
      position: 8,
      result: true
    },
    {
      state: [0, 1, 0, 2, 2, 2, 1, 1, 0, 2, 0, 1, 0, 0, 0, 2],
      position: 10,
      result: true
    }
  ])('%p', ({ state, position, result }) => {

    expect(tileCanBeSolved(state, position)).toEqual(result)
  });
});
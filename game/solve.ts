import { IGameTiles } from "./game.interface";
import { listToMatrix, transpose } from "./validate-game";
import { getCoordinates, randomIntBetween } from "./helper";
import { generateFull } from "./simple-game";

export function breakDown(state: IGameTiles) {

  let stateCopy = [...state];

  while (true) {

    const filledIndexes = stateCopy.map((v, i) => v ? i : null).filter(v => v !== null);

    if (filledIndexes.length < 7) {

      return stateCopy;
    }

    const indexOnFilled = randomIntBetween(0, filledIndexes.length);
    const indexToErase = filledIndexes[indexOnFilled]
    const stateCopyWithErased = [...stateCopy];

    stateCopyWithErased[indexToErase] = 0;

    if (!someTileCanBeSolved(stateCopyWithErased)) {

      return stateCopy;
    }

    stateCopy = stateCopyWithErased;
  }
}

export function tileCanBeSolved(state: IGameTiles, tilePosition: number) {

  const matrix = listToMatrix(state);
  const transposedMatrix = transpose(matrix);
  const [x, y] = getCoordinates(tilePosition);

  const validations = [
    () => canResolveLineHalfFilled(matrix[x]),
    () => canResolveLineHalfFilled(transposedMatrix[y]),
    () => canResolveEqualLines([...matrix], x),
    () => canResolveEqualLines([...transposedMatrix], y),
  ];

  for (const validation of validations) {

    if (validation()) {

      return true;
    }
  }

  return false;
}

function someTileCanBeSolved(state: IGameTiles) {

  const emptyIndexes = state.map((v, i) => v === 0 ? i : null).filter(v => v !== null);

  for (const emptyIndex of emptyIndexes) {

    if (tileCanBeSolved(state, emptyIndex)) {

      return true;
    }
  }

  false;
}

function canResolveLineHalfFilled(line: IGameTiles) {

  const max = line.length / 2;

  for (const value of [1, 2]) {

    if (line.filter(v => v === value).length === max) {

      return true;
    }
  }

  return false;
}

function canResolveEqualLines(matrix: IGameTiles[], index: number) {


  const [line] = matrix.splice(index);

  if (line.filter(v => v === 0).length === 2) {

    for (const compareLine of matrix) {

      if (compareLineExceptMainEmpty(line, compareLine)) {

        return true;
      }
    }
  }

  return false;
}

function compareLineExceptMainEmpty(mainLine: IGameTiles, compareLine: IGameTiles) {

  for (let i = 0; i < mainLine.length; i++) {

    const mainLineValue = mainLine[i];
    const compareLineValue = compareLine[i];

    if (mainLineValue) {

      if (mainLineValue !== compareLineValue) {

        return false;
      }
    }
  }

  return true;
}

breakDown(generateFull(4));
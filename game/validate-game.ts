export type IGameTiles = number[];

export const validate = (tiles: IGameTiles) => {

  const matrix = listToMatrix(tiles);
  const transposedMatrix = transpose(matrix);

  const validations = [
    () => {
      // console.log('validateSequence(matrix)');
      return validateSequence(matrix)
    },
    () => {
      // console.log('validateSequence(transposedMatrix)');
      return validateSequence(transposedMatrix)
    },
    () => {
      // console.log('validateEquilibrium(matrix)');
      return validateEquilibrium(matrix)
    },
    () => {
      // console.log('validateEquilibrium(transposedMatrix)');
      return validateEquilibrium(transposedMatrix)
    },
    () => {
      // console.log('validateEquality(matrix)');
      return validateEquality(matrix)
    },
    () => {
      // console.log('validateEquality(transposedMatrix)');
      return validateEquality(transposedMatrix)
    },
  ];

  for (const validate of validations) {

    if (!validate()) {

      return false;
    }
  }

  return true;
}

export const validateSequence = (lines: IGameTiles[]) => {

  for (const line of lines) {

    const groups: number[] = [];

    line.forEach((tile, index) => {

      if (tile) {

        if (tile === line[index - 1]) {

          groups[groups.length - 1] = groups[groups.length - 1] + 1;
        } else {

          groups.push(1);
        }
      }
    });

    if (groups.some(group => group > 2)) {

      return false;
    }
  }

  return true;
}

export const validateEquilibrium = (lines: IGameTiles[]) => {

  const max = lines.length / 2;

  for (const line of lines) {

    for (const value of [1, 2]) {

      if (line.filter(tile => tile === value).length > max) {

        return false;
      }
    }
  }

  return true;
}

export const validateEquality = (lines: IGameTiles[]) => {

  for (let i = 0; i < lines.length; i++) {

    const line = lines[i];

    for (let j = i + 1; j < lines.length; j++) {

      const compareLine = lines[j];

      if (isEqualLine(line, compareLine)) {

        return false;
      }
    }
  }

  return true;
}

export const listToMatrix = (line: IGameTiles) => {

  const lineSize = Math.sqrt(line.length);
  const result: IGameTiles[] = [];

  for (let i = 0; i < line.length; i = i + lineSize) {

    result.push(line.slice(i, i + lineSize));
  }

  return result;
}

export const transpose = (lines: IGameTiles[]) => {

  const transposed = [];

  for (let i = 0; i < lines.length; i++) {

    const row = [];

    for (let j = 0; j < lines.length; j++) {

      row.push(lines[j][i]);
    }

    transposed.push(row);
  }

  return transposed;
}

const isEqualLine = (lineOne: IGameTiles, lineTwo: IGameTiles) => {

  for (let i = 0; i < lineOne.length; i++) {
    const lineOneElement = lineOne[i];
    const lineTwoElement = lineTwo[i];

    if (lineOneElement === 0 || lineTwoElement === 0) {

      return false;
    }

    if (lineOneElement !== lineTwoElement) {

      return false;
    }
  }

  return true;
}
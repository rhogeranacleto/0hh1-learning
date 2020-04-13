import { validate, IGameTiles } from "./validate-game";

const zeroFillLeft = (nr: string, n: number, str?: string) => Array(n - String(nr).length + 1).join(str || '0') + nr;

const shuffle = (sourceArray: string[]) => {

  for (var n = 0; n < sourceArray.length - 1; n++) {

    var k = n + Math.floor(Math.random() * (sourceArray.length - n));

    var temp = sourceArray[k];
    sourceArray[k] = sourceArray[n];
    sourceArray[n] = temp;
  }

  return sourceArray;
};

const fillArray = (min: number, max: number, repeatEachValue: number) => {

  if (!repeatEachValue) {

    repeatEachValue = 1;
  }

  const arr = new Array();

  for (var repeat = 0; repeat < repeatEachValue; repeat++) {

    for (var i = min; i <= max; i++) {

      arr.push(i);
    }
  }

  return arr;
};

const getIndex = (x: number, y: number, size: number) => y * size + x;

const tripleReg = new RegExp('0{3}|1{3}', 'g');

export function generateFull(size: number) {

  const combos = [];
  const result = new Array(size * size).fill(0);
  const maxPerRow = Math.ceil(size / 2);

  function generateCombos() {

    for (var i = 0, l = Math.pow(2, size); i < l; i++) {

      var binaryIndex = zeroFillLeft((i).toString(2), size);

      if (binaryIndex.match(tripleReg) ||
        (binaryIndex.split('0').length - 1) > maxPerRow ||
        (binaryIndex.split('1').length - 1) > maxPerRow) {

        continue;
      }

      combos.push(binaryIndex);
    }
  }

  generateCombos();

  shuffle(combos);

  function clearRow(y: number) {

    for (var x = 0; x < size; x++) {

      result[getIndex(x, y, size)] = 0;
    }

    const combo = comboUsed[y];

    if (combo) {

      combos.push(combo);
      delete comboUsed[y];
    }
  }

  let y = 0;
  const comboUsed = [];
  const attempts = fillArray(0, 0, size);

  do {

    attempts[y]++;
    const combo = combos.shift();

    for (var x = 0; x < size; x++) {

      result[getIndex(x, y, size)] = (combo.charAt(x) * 1) + 1;
    }

    if (validate(result)) {

      comboUsed[y] = combo;
      y++;
    } else {

      combos.push(combo);
      clearRow(y);

      if (attempts[y] >= combos.length) {

        attempts[y] = 0;
        const clearFromY = 1;

        for (var y2 = clearFromY; y2 < y; y2++) {

          clearRow(y2);
          attempts[y2] = 0;
        }

        y = clearFromY;
      }
    }
  } while (y < size);

  return result;
}

export interface IAction {
  // x: number;
  // y: number;
  index: number;
  color: number;
}

// export function transformAction(action: IAction): IAction {

//   return {
//     x: Math.floor((action.x * 100) / 25),
//     y: Math.floor((action.y * 100) / 25),
//     color: Math.floor((action.color * 100) / 50) + 1,
//   }
// }

export function transformAction(action: number): IAction {

  const index = action >= 16 ? action - 16 : action;

  return {
    index,
    color: action >= 16 ? 2 : 1,
  }
}

interface IActionReturn {
  reward: number;
  nextState: IGameTiles;
  done: boolean;
}

export function doAction(state: IGameTiles, action: number): IActionReturn {

  const { index, color } = transformAction(action);

  if (state[index] !== 0) {

    return {
      reward: -0.8,
      nextState: state,
      done: false,
    };
  }

  const nextState = [...state];

  nextState[index] = color;

  if (validate(nextState)) {

    return {
      reward: 0.6,
      nextState,
      done: nextState.every(Boolean)
    };
  }

  return {
    reward: -0.6,
    nextState,
    done: true,
  };
}
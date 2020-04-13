export const zeroFillLeft = (nr: string, n: number, str?: string) => Array(n - String(nr).length + 1).join(str || '0') + nr;

export const shuffle = (sourceArray: string[]) => {

  for (var n = 0; n < sourceArray.length - 1; n++) {

    var k = n + Math.floor(Math.random() * (sourceArray.length - n));

    var temp = sourceArray[k];
    sourceArray[k] = sourceArray[n];
    sourceArray[n] = temp;
  }

  return sourceArray;
};

export const fillArray = (min: number, max: number, repeatEachValue: number) => {

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

export const getIndex = (x: number, y: number, size: number) => y * size + x;

export const getCoordinates = (i: number) => [Math.floor(i / 4), i % 4];

export const randomIntBetween = (min: number, max: number) => Math.floor(Math.random() * max) + min;
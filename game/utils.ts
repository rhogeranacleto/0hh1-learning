/* 
 * Utils
 * Martin's senile little utility belt library for being an #omyac
 * Please do not build life support systems with it.
 * (c) 2014 Q42
 * http://q42.com | @q42
 * Written by Martin Kool
 * martin@q42.nl | @mrtnkl
 */
export function isDoubleTapBug(evt) {
  if (!('ontouchstart' in document.documentElement)) return false;
  if (!evt.originalEvent.touches) {
    evt.preventDefault();
    evt.stopPropagation();
    return true;
  }
  return false;
}


export function isTouch() {
  return 'ontouchstart' in document.documentElement;
}

export function padLeft(nr: string, n: number, str?: string) {
  return Array(n - String(nr).length + 1).join(str || '0') + nr;
}

export function trim(s) {
  return s.replace(/^\s*|\s*$/gi, '');
}

export function between(min: number, max: number, decimals?: number) {
  if (decimals) {

    return Number(
      ((Math.random() * (max - min)) + min).toFixed(decimals)
    ) * 1;
  }

  return Math.floor((Math.random() * (max - min + 1)) + min);
}

export function shuffleSimple(sourceArray) {
  sourceArray.sort(function () { return .5 - Math.random(); });
  return sourceArray;
}

export function shuffle(sourceArray) {
  for (var n = 0; n < sourceArray.length - 1; n++) {
    var k = n + Math.floor(Math.random() * (sourceArray.length - n));

    var temp = sourceArray[k];
    sourceArray[k] = sourceArray[n];
    sourceArray[n] = temp;
  }
  return sourceArray;
}

export function index(obj, i) {
  var j = 0;
  for (var name in obj) {
    if (j == i)
      return obj[name];
    j++;
  }
}

export function areArraysEqual(arr1, arr2) {
  if (!arr1 || !arr2) return false;
  return arr1.join('|') === arr2.join('|'); // dirty but enough
}

export function count(obj) {
  var count = 0;
  for (var name in obj)
    count++;
  return count;
}

export function eat(e) {
  e.preventDefault();
  e.stopPropagation();
  return false;
}

export function pick(arr) {
  var drawFromArr = arr;
  if (arr.constructor == Object) {
    drawFromArr = [];
    for (var id in arr)
      drawFromArr.push(id);
  }
  var drawIndex = between(0, drawFromArr.length - 1);
  if (drawFromArr.length == 0)
    return null;
  return drawFromArr[drawIndex];
}

export function draw(arr, optionalValueToMatch) {
  var drawFromArr = arr;
  if (arr.constructor == Object) {
    drawFromArr = [];
    for (var id in arr)
      drawFromArr.push(id);
  }
  if (drawFromArr.length == 0)
    return null;
  var drawIndex = between(0, drawFromArr.length - 1);
  // if a value was given, find that one
  if (optionalValueToMatch != undefined) {
    var foundMatch = false;
    for (var i = 0; i < drawFromArr.length; i++) {
      if (drawFromArr[i] == optionalValueToMatch) {
        drawIndex = i;
        foundMatch = true;
        break;
      }
    }
    if (!foundMatch)
      return null;
  }
  var value = drawFromArr[drawIndex];
  drawFromArr.splice(drawIndex, 1);
  return value;
}
// removes the given value from arr
export function removeFromArray(arr, val) {
  if (arr.length == 0)
    return null;
  var foundMatch = false, drawIndex = -1;
  for (var i = 0; i < arr.length; i++) {
    if (arr[i] == val) {
      drawIndex = i;
      foundMatch = true;
      break;
    }
  }
  if (!foundMatch)
    return null;
  var value = arr[drawIndex];
  arr.splice(drawIndex, 1);
  return value;
}

export function toArray(obj) {
  var arr = [];
  for (var id in obj)
    arr.push(id);
  return arr;
}

export function fillArray(min: number, max: number, repeatEachValue: number) {
  if (!repeatEachValue)
    repeatEachValue = 1;
  let arr: number[] = [];
  for (var repeat = 0; repeat < repeatEachValue; repeat++)
    for (var i = min; i <= max; i++)
      arr.push(i);
  return arr;
}

export function contains(arr, item) {
  for (var i = 0; i < arr.length; i++)
    if (arr[i] == item)
      return true;
  return false;
}

export function setCookie(name, value, days) {
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    var expires = "; expires=" + date.toISOString();
  } else
    var expires = "";
  document.cookie = name + "=" + value + expires + "; path=/";
}

export function getCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ')
      c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0)
      return c.substring(nameEQ.length, c.length);
  }
  return null;
}

export function clearCookie(name) {
  this.setCookie(name, "", -1);
}

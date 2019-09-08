import { Tile } from './tile';

export class Grid {

  public id: string;
  public width: number;
  public height: number;
  public tiles: Tile[];
  public emptyTile: Tile;
  public maxPerRow: number;
  public maxPerCol: number;
  public wreg: RegExp;
  public hreg: RegExp;
  public tripleReg: RegExp;
  public count0reg: RegExp;
  public count1reg: RegExp;
  public count2reg: RegExp;
  public quality: number;
  public tileToSolve: Tile;
  public state: State;
  public hint: number;

  constructor(
    public size: number) {

    this.id = 'board';
    this.width = size;
    this.height = size;
    this.tiles = [];
    this.emptyTile = new Tile(-99, this, -99);
    this.maxPerRow = Math.ceil(this.width / 2);
    this.maxPerCol = Math.ceil(this.height / 2);
    this.wreg = new RegExp('[12]{' + this.width + '}');
    this.hreg = new RegExp('[12]{' + this.height + '}');
    this.tripleReg = new RegExp('1{3}|2{3}');
    this.count0reg = new RegExp('[^0]', 'g');
    this.count1reg = new RegExp('[^1]', 'g');
    this.count2reg = new RegExp('[^2]', 'g');
    this.quality = 0;
    this.tileToSolve = null;
    this.state = new State(this);
    this.hint = new Hint(this);

    // gridInfo section is for speeding up this.isValid method
    this.gridInfo = {
      cols: [],
      rows: [],
      colInfo: [],
      rowInfo: []
    }

    for (var i = 0; i < this.width; i++) {
      gridInfo.cols[i] = Utils.fillArray(0, 0, this.height);
      gridInfo.rows[i] = Utils.fillArray(0, 0, this.width);
    }
  }

  public each(handler) {
    for (var i = 0; i < this.tiles.length; i++) {
      var x = i % this.width,
        y = Math.floor(i / this.width),
        tile = this.tiles[i],
        result = handler.call(tile, x, y, i, tile);
      if (result)
        break;
    }
    return this;
  }

  public load(values, fullStateValues) {
    if (values) {
      this.width = this.height = Math.sqrt(values.length);
      if (fullStateValues)
        this.state.save('full', fullStateValues);
    }
    this.tiles = [];
    for (var i = 0; i < this.width * this.height; i++) {
      var value = values ? values[i] : 0;
      this.tiles[i] = new Tile(value, this, i);
    }
    return this;
  }

  public getIndex(x, y) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height)
      return -1;
    return y * this.width + x;
  }

  public getTile(x, y) {
    // if no y is specified, use x as interger
    if (isNaN(x)) return this.emptyTile;
    if (isNaN(y)) {
      var i = x;
      x = i % this.width,
        y = Math.floor(i / this.width);
    }
    if (x < 0 || x >= this.width || y < 0 || y >= this.height)
      return this.emptyTile;
    return this.tiles[this.getIndex(x, y)];
  }

  public clear() {
    this.each(function () { this.clear(); });
    return this;
  }

  public getEmptyTiles() {
    var emptyTiles = [];
    this.each(function () {
      if (this.isEmpty)
        emptyTiles.push(this);
    })
    return emptyTiles;
  }

  public generate() {
    var result = this.solve(true);
    this.state.save('full');
    return result;
  }

  public step(isGenerating: boolean) {
    return this.solve(isGenerating, true);
  }

  public ease(percentage) {
    var emptyTiles = this.getEmptyTiles(),
      easeCount = percentage ? Math.floor((percentage / 100) * emptyTiles.length) : 1;
    if (!emptyTiles.length)
      return this;

    Utils.shuffle(emptyTiles);
    for (var i = 0; i < easeCount; i++) {
      var tile = emptyTiles[i];
      tile.value = this.state.getValueForTile('full', tile.x, tile.y);
    }
    return this;
  }

  public solve(isGenerating: boolean, stepByStep: boolean) {
    var attempts = 0,
      tile,
      emptyTiles,
      pool = this.tiles;

    this.state.clear();

    // for stepByStep solving, randomize the pool
    if (isGenerating || stepByStep) {
      var pool = this.tiles.concat();
      Utils.shuffle(pool);
    }
    // if tileToSolve, put its row/col items first as they hugely increase time to solve tileToSolve
    if (this.tileToSolve) {
      var sameRow = [],
        sameCol = [],
        pool2 = [];
      this.each(function (x, y, i) {
        if (x == this.tileToSolve.x)
          sameCol.push(this)
        else if (y == this.tileToSolve.y)
          sameRow.push(this)
        else
          pool2.push(this);
      });
      // put all its row/col items first, then this.tileToSolve (again), then the rest
      pool = sameRow.concat(sameCol, [this.tileToSolve], pool2);
    }

    var totalAtt = this.width * this.height * 50;
    while (attempts++ < totalAtt) {
      emptyTiles = [];
      var tileChanged = false;

      // phase 1: try easy fixes while building a pool of remaining empty tiles
      for (var i = 0; i < pool.length; i++) {
        tile = pool[i];
        if (!tile.isEmpty)
          continue
        var tileCanBeSolved = this.solveTile(tile);
        if (tileCanBeSolved) {
          if (this.hint.active)
            return;
          tileChanged = tile;
          break;
        }
        else {
          emptyTiles.push(tile);
        }
      }

      // when the broken tile was found, quickly return true!
      if (this.tileToSolve && tileChanged && this.tileToSolve.x == tileChanged.x && this.tileToSolve.y == tileChanged.y) {
        //console.log('quickwin!', attempts)
        return true;
      }

      // phase 2: no tile changed and empty ones left: pick random and try both values
      if (!tileChanged && emptyTiles.length && isGenerating) {
        tile = emptyTiles[0];
        // try both values
        var valueToTry = Utils.pick(tile.possibleValues);
        tile.value = valueToTry;
        this.state.push(tile); // mark this value as used
        if (!this.isValid()) {
          this.state.pop(tile);
          tile.value = valueToTry == 1 ? 2 : 1;
          this.state.push(tile);
          if (!this.isValid()) {
            this.state.pop(tile);
          }
        }

        continue;
      }

      // phase 3: push changed tile and check validity
      if (tileChanged) {
        this.state.push(tileChanged);
        if (!this.isValid()) {
          this.state.pop();
        }
      }
      // no tile changed and no empty tiles left? break the while loop!
      else
        break;

      if (stepByStep) {
        break; // step by step solving? quit
      }
    }

    //console.log(attempts, isGenerating == true)

    return this.getEmptyTiles().length == 0;
  }

  public generateFast() {

    function generateCombos() {
      for (var i = 0, l = Math.pow(2, this.width); i < l; i++) {
        var c = Utils.padLeft((i).toString(2), this.width);
        if (c.match(this.tripleReg) ||
          (c.split(0).length - 1) > this.maxPerRow ||
          (c.split(1).length - 1) > this.maxPerRow)
          continue;
        combos.push(c);
      }
    }

    generateCombos();

    Utils.shuffle(combos);

    function clearRow(y) {
      for (var x = 0; x < this.width; x++) {
        var tile = getTile(x, y);
        tile.clear();
      }
      var combo = comboUsed[y];
      if (combo) {
        combos.push(combo);
        delete comboUsed[y];
      }
    }

    var y = 0,
      comboUsed = [],
      attempts = Utils.fillArray(0, 0, this.width);
    do {
      attempts[y]++;
      var combo = combos.shift();
      for (var x = 0; x < this.width; x++) {
        var tile = getTile(x, y);
        tile.value = (combo.charAt(x) * 1) + 1;
      }
      if (this.isValid()) {
        comboUsed[y] = combo;
        y++;
      }
      else {
        combos.push(combo);
        clearRow(y);
        if (attempts[y] >= combos.length) {
          attempts[y] = 0;
          var clearFromY = 1;
          for (var y2 = clearFromY; y2 < y; y2++) {
            clearRow(y2);
            attempts[y2] = 0;
          }
          y = clearFromY;
        }
      }
    } while (y < this.height);
    this.state.save('full');
  }

  public solveTile(tile) {
    tile.collect(this.hint);

    // if the current tile already has a closed path with either value 1 or 0, consider the other one as single option
    if (this.state.currentState) {
      if (this.state.currentState[tile.id2])
        tile.possibleValues = [1];
      else if (this.state.currentState[tile.id1])
        tile.possibleValues = [2];
    }

    if (tile.possibleValues.length == 1) {

      if (this.hint.active)
        return true;

      // tile can be solved
      tile.value = tile.possibleValues[0];
      return true;
    }
    if (tile.emptyRowPairWith) {
      if (this.findCombo(tile, tile.emptyRowPairWith)) {

        // if we're looking for a this.hint, clear the tile and set the this.hint
        if (this.hint.active) {
          tile.clear();
          var hType = HintType.SinglePossibleRowCombo,
            doubleRowOrCol = [];
          if (this.hint.doubleColFound.length) {
            hType = HintType.ColsMustBeUnique;
            doubleRowOrCol = this.hint.doubleColFound;
          }
          else if (this.hint.doubleRowFound.length) {
            hType = HintType.RowsMustBeUnique;
            doubleRowOrCol = this.hint.doubleRowFound;
          }
          this.hint.mark(tile, hType, tile.emptyRowPairWith, doubleRowOrCol);
          return true;
        }

        // tile can be solved
        return true;
      }
    }
    if (tile.emptyColPairWith) {
      if (this.findCombo(tile, tile.emptyColPairWith)) {

        // if we're looking for a this.hint, clear the tile and set the this.hint
        if (this.hint.active) {
          tile.clear();
          var hType = HintType.SinglePossibleColCombo,
            doubleRowOrCol = [];
          if (this.hint.doubleColFound.length) {
            hType = HintType.ColsMustBeUnique;
            doubleRowOrCol = this.hint.doubleColFound;
          }
          else if (this.hint.doubleRowFound.length) {
            hType = HintType.RowsMustBeUnique;
            doubleRowOrCol = this.hint.doubleRowFound;
          }
          this.hint.mark(tile, hType, tile.emptyColPairWith, doubleRowOrCol);
          return true;
        }

        // tile can be solved
        return true;
      }
    }
    return false;
  }

  // finds a valid combo for tile1 and tile2 based on inverting an invalid attempt
  public findCombo(tile, tile2) {
    // see if we're checking a row or column
    for (var valueForTile1 = 1; valueForTile1 <= 2; valueForTile1++) {
      tile.value = valueForTile1;
      tile2.value = valueForTile1 == 1 ? 2 : 1;
      if (!this.isValid()) {
        // only fill out a single tile (the first), which makes backtracking easier
        tile.value = valueForTile1 == 1 ? 2 : 1;
        tile2.clear();
        return true;
      }
    }
    tile.clear();
    tile2.clear();
    return false;
  }

// gridInfo section is for speeding up this.isValid method
var gridInfo = {
  cols: [],
  rows: [],
  colInfo: [],
  rowInfo: []
}
for (var i = 0; i < this.width; i++) {
  gridInfo.cols[i] = Utils.fillArray(0, 0, this.height);
  gridInfo.rows[i] = Utils.fillArray(0, 0, this.width);
}

  // used for keeping row/col info, and erasing their string representations upon a value change
  public setValue(x, y, i, v) {
  gridInfo.cols[x][y] = v;
  gridInfo.rows[y][x] = v;
  gridInfo.colInfo[x] = 0;
  gridInfo.rowInfo[y] = 0;
}

  public getColInfo(i) {
  var info = gridInfo.colInfo[i];
  if (!info) {
    var str = gridInfo.cols[i].join('');
    info = gridInfo.colInfo[i] = {
      str: str,
      nr0s: str.replace(count0reg, '').length,
      nr1s: str.replace(count1reg, '').length,
      //nr2s: str.replace(count2reg,'').length, 
      hasTriple: tripleReg.test(str),
      //isFull: !/0/.test(str)
    }
    info.isFull = info.nr0s == 0;
    info.nr2s = this.height - info.nr0s - info.nr1s;
    info.isInvalid = info.nr1s > maxPerRow || info.nr2s > maxPerRow || info.hasTriple;
  }
  return info;
}

  public getRowInfo(i) {
  var info = gridInfo.rowInfo[i];
  if (!info) {
    var str = gridInfo.rows[i].join('');
    info = gridInfo.rowInfo[i] = {
      str: str,
      nr0s: str.replace(count0reg, '').length,
      nr1s: str.replace(count1reg, '').length,
      //nr2s: str.replace(count2reg,'').length, 
      hasTriple: tripleReg.test(str)
      //isFull: !/0/.test(str)
    }
    info.isFull = info.nr0s == 0;
    info.nr2s = this.width - info.nr0s - info.nr1s;
    info.isInvalid = info.nr1s > maxPerRow || info.nr2s > maxPerRow || info.hasTriple;
  }
  return info;
}

  // not a full this.isValid check, only checks for balanced spread of 0's and 1's
  public isValid() {
  this.hint.doubleColFound = [];
  this.hint.doubleRowFound = [];

  var rows = {},
    cols = {};
  for (var i = 0; i < this.width; i++) {
    var info = getColInfo(i);
    // if too many 1's or 2's found, or three in a row, leave
    if (info.isInvalid)
      return false;
    // if no empty tiles found, see if it's double
    if (info.isFull) {
      if (cols[info.str]) {

        info.unique = false;

        if (this.hint.active)
          this.hint.doubleColFound.push(cols[info.str] - 1, i);
        return false;
      }
      else {
        info.unique = true;
        cols[info.str] = i + 1;
      }
    }

    var info = getRowInfo(i);
    // if too many 1's or 2's found, or three in a row, leave
    if (info.isInvalid)
      return false;
    // if no empty tiles found, see if it's double
    if (info.isFull) {
      if (rows[info.str]) {

        info.unique = false;

        if (this.hint.active)
          this.hint.doubleRowFound.push(rows[info.str] - 1, i);
        return false;
      }
      else {
        info.unique = true;
        rows[info.str] = i + 1;
      }
    }
  }

  return true;
}

  public breakDownSimple() {
  var tile,
    pool = tiles.concat(),
    i = 0;

  Utils.shuffle(pool);
  var remainingTiles = [];

  while (i < pool.length) {
    tile = pool[i++];
    var prevValue = tile.value;
    tile.clear();
    // if only this one cleared tile cannot be solved
    if (!solveTile(tile)) {
      // restore its value
      tile.value = prevValue;
      remainingTiles.push(tile);
    } else {
      tile.clear();
    }
  }
  quality = Math.round(100 * (getEmptyTiles().length / (this.width * this.height)));
  return remainingTiles;
}
  
  public breakDown(remainingTiles) {
  var attempts = 0,
    tile,
    pool = remainingTiles || tiles.concat();

  this.tileToSolve = null;
  this.state.clear();
  //State.save('full');

  //console.log('items to solve', pool.length)

  if (!remainingTiles)
    Utils.shuffle(pool); // not shuffling increases quality!

  var i = 0;
  while (i < pool.length && attempts++ < 6) {
    tile = pool[i++];
    this.tileToSolve = tile;
    var clearedTile = tile,
      clearedTileValue = tile.value;
    tile.clear();
    this.state.save('breakdown');
    //console.log('save breakdown')
    if (solve()) {
      this.state.restore('breakdown');
      attempts = 0;
    } else {
      this.state.restore('breakdown');
      clearedTile.value = clearedTileValue;
    }
  }
  this.tileToSolve = null;
  this.state.save('empty');
  quality = Math.round(100 * (getEmptyTiles().length / (this.width * this.height)));

  // mark remaining tiles as system
  each(function () {
    if (!this.isEmpty)
      this.system = true;
  })
}

  public markRow(y) {
  for (var x = 0; x < this.width; x++)
    tile(x, y).mark();
  return this;
}
  
  public unmarkRow(y) {
  for (var x = 0; x < this.width; x++)
    tile(x, y).unmark();
  return this;
}

  public markCol(x) {
  for (var y = 0; y < this.height; y++)
    tile(x, y).mark();
  return this;
}
  
  public unmarkCol(x) {
  for (var y = 0; y < this.height; y++)
    tile(x, y).unmark();
  return this;
}

  public unmark(x, y) {
  if (typeof x == 'number' && typeof y == 'number') {
    tile(x, y).unmark();
    return this;
  }
  for (var y = 0; y < this.height; y++)
    for (var x = 0; x < this.width; x++)
      tile(x, y).unmark();
  return this;
}

  public mark(x, y) {
  tile(x, y).mark();
  return this;
}

  public getWrongTiles() {
  var wrongTiles = [];
  each(function (x, y, i, tile) {
    var currentValue = tile.value,
      okValue = this.state.getValueForTile('full', x, y);
    if (currentValue > 0 && currentValue != okValue)
      wrongTiles.push(tile);
  })
  return wrongTiles;
}

  public getValues() {
  var values = [];
  each(function () { values.push(this.value) });
  return values;
}
}
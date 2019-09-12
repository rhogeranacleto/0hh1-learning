import { Tile } from './tile';
import * as Utils from './utils';
import { State } from './state';
import { Hint, HintType } from './hint';

const tripleReg = new RegExp('1{3}|2{3}');
const count0reg = new RegExp('[^0]', 'g');
const count1reg = new RegExp('[^1]', 'g');
const count2reg = new RegExp('[^2]', 'g');

interface IInfo {
  str: string;
  nr0s: number;
  nr1s: number;
  hasTriple: boolean;
  isFull: boolean;
  nr2s: number;
  isInvalid: boolean;
  unique?: boolean;
};

export class Grid {

  private id: string;
  public width: number;
  public height: number;
  public tiles: Tile[];
  private emptyTile: Tile;
  public maxPerRow: number;
  public maxPerCol: number;
  private wreg: RegExp;
  private hreg: RegExp;
  public quality: number;
  private tileToSolve: Tile;
  public state: State;
  private hint: Hint;
  private gridInfo: {
    cols: number[][];
    rows: number[][];
  }

  constructor(
    private size: number) {

    this.id = 'board';
    this.width = size;
    this.height = size;
    this.tiles = [];
    this.emptyTile = new Tile(-99, this, -99);
    this.maxPerRow = Math.ceil(this.width / 2);
    this.maxPerCol = Math.ceil(this.height / 2);
    this.wreg = new RegExp('[12]{' + this.width + '}');
    this.hreg = new RegExp('[12]{' + this.height + '}');

    this.quality = 0;
    this.tileToSolve = null;
    this.state = new State(this);
    this.hint = new Hint(this);

    // gridInfo section is for speeding up this.isValid method
    this.gridInfo = {
      cols: [],
      rows: []
    }

    for (var i = 0; i < this.width; i++) {
      this.gridInfo.cols[i] = Utils.fillArray(0, 0, this.height);
      this.gridInfo.rows[i] = Utils.fillArray(0, 0, this.width);
    }
  }

  private each(handler: (x: number, y: number, i: number, tile: Tile) => void) {
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

  public load(values?, fullStateValues?) {
    if (values) {
      this.width = this.height = Math.sqrt(values.length);
      if (fullStateValues)
        this.state.save('full', fullStateValues);
    }
    this.tiles = [];
    for (var i = 0; i < this.width * this.height; i++) {
      var value = values ? values[i] : 0;
      this.tiles[i] = new Tile(value, this, i);
      this.gridInfo.cols[this.tiles[i].x][this.tiles[i].y] = value;
      this.gridInfo.rows[this.tiles[i].y][this.tiles[i].x] = value;
    }
    return this;
  }

  private getIndex(x: number, y: number) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height)
      return -1;
    return y * this.width + x;
  }

  public getTile(x: number, y: number) {
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

    this.each((x, y, i, tile) => {

      tile.clear();
    });

    return this;
  }

  private getEmptyTiles() {

    var emptyTiles = [];
    this.each((x, y, i, tile) => {

      if (tile.isEmpty) {

        emptyTiles.push(tile);
      }
    });

    return emptyTiles;
  }

  private generate() {
    var result = this.solve(true);
    this.state.save('full');
    return result;
  }

  private step(isGenerating: boolean) {
    return this.solve(isGenerating, true);
  }

  private ease(percentage) {
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

  public solve(isGenerating?: boolean, stepByStep?: boolean) {

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
      this.each((x, y, i, tile) => {

        if (x == this.tileToSolve.x)
          sameCol.push(tile)
        else if (y == this.tileToSolve.y)
          sameRow.push(tile)
        else
          pool2.push(tile);
      });
      // put all its row/col items first, then this.tileToSolve (again), then the rest
      pool = sameRow.concat(sameCol, [this.tileToSolve], pool2);
    }

    var totalAtt = this.width * this.height * 50;
    while (attempts++ < totalAtt) {
      emptyTiles = [];
      let tileChanged: any = false;

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
          this.state.pop();
          tile.value = valueToTry == 1 ? 2 : 1;
          this.state.push(tile);
          if (!this.isValid()) {
            this.state.pop();
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

  private generateCombos(combos: any[]) {

    for (var i = 0, l = Math.pow(2, this.width); i < l; i++) {

      var c = Utils.padLeft((i).toString(2), this.width);
      if (c.match(tripleReg) ||
        (c.split('0').length - 1) > this.maxPerRow ||
        (c.split('1').length - 1) > this.maxPerRow)
        continue;

      combos.push(c);
    }
  }

  private clearRow(y: number, combos: any[], comboUsed: any[]) {
    for (var x = 0; x < this.width; x++) {
      var tile = this.getTile(x, y);
      tile.clear();
    }
    var combo = comboUsed[y];
    if (combo) {
      combos.push(combo);
      delete comboUsed[y];
    }
  }

  public generateFast() {

    const combos = [];
    let y = 0;
    const comboUsed = [];
    const attempts = Utils.fillArray(0, 0, this.width);

    this.generateCombos(combos);

    Utils.shuffle(combos);

    do {
      attempts[y]++;
      var combo = combos.shift();
      for (var x = 0; x < this.width; x++) {
        var tile = this.getTile(x, y);
        tile.value = (combo.charAt(x) * 1) + 1;
      }
      if (this.isValid()) {
        comboUsed[y] = combo;
        y++;
      }
      else {
        combos.push(combo);
        this.clearRow(y, combos, comboUsed);
        if (attempts[y] >= combos.length) {
          attempts[y] = 0;
          var clearFromY = 1;
          for (var y2 = clearFromY; y2 < y; y2++) {
            this.clearRow(y2, combos, comboUsed);
            attempts[y2] = 0;
          }
          y = clearFromY;
        }
      }
    } while (y < this.height);

    this.state.save('full');
  }

  private solveTile(tile: Tile) {

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
          // this.hint.mark(tile, hType, tile.emptyRowPairWith, doubleRowOrCol);
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
          // this.hint.mark(tile, hType, tile.emptyColPairWith, doubleRowOrCol);
          return true;
        }

        // tile can be solved
        return true;
      }
    }
    return false;
  }

  // finds a valid combo for tile1 and tile2 based on inverting an invalid attempt
  private findCombo(tile: Tile, tile2: Tile) {
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

  // used for keeping row/col info, and erasing their string representations upon a value change
  public setValue(x: number, y: number, i: number, v: number) {
    this.gridInfo.cols[x][y] = v;
    this.gridInfo.rows[y][x] = v;
  }

  public getColInfo(i: number): IInfo {

    var str = this.gridInfo.cols[i].join('');

    const mountInfo = {
      str: str,
      nr0s: str.replace(count0reg, '').length,
      nr1s: str.replace(count1reg, '').length,
      hasTriple: tripleReg.test(str),
      isFull: false,
      nr2s: 0,
      isInvalid: false
    }

    mountInfo.isFull = mountInfo.nr0s == 0;
    mountInfo.nr2s = this.height - mountInfo.nr0s - mountInfo.nr1s;
    mountInfo.isInvalid = mountInfo.nr1s > this.maxPerRow || mountInfo.nr2s > this.maxPerRow || mountInfo.hasTriple;

    return mountInfo;
  }

  public getRowInfo(i: number): IInfo {

    let str = this.gridInfo.rows[i].join('');
    const mountInfo = {
      str: str,
      nr0s: str.replace(count0reg, '').length,
      nr1s: str.replace(count1reg, '').length,
      nr2s: 0,
      hasTriple: tripleReg.test(str),
      isFull: false,
      isInvalid: true
    }

    mountInfo.isFull = mountInfo.nr0s == 0;
    mountInfo.nr2s = this.width - mountInfo.nr0s - mountInfo.nr1s;
    mountInfo.isInvalid = mountInfo.nr1s > this.maxPerRow || mountInfo.nr2s > this.maxPerRow || mountInfo.hasTriple;

    return mountInfo;
  }

  // not a full this.isValid check, only checks for balanced spread of 0's and 1's
  public isValid() {
    this.hint.doubleColFound = [];
    this.hint.doubleRowFound = [];

    var rows = {},
      cols = {};
    for (var i = 0; i < this.width; i++) {
      var info = this.getColInfo(i);
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

      var info = this.getRowInfo(i);
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

  private breakDownSimple() {
    var tile,
      pool = this.tiles.concat(),
      i = 0;

    Utils.shuffle(pool);
    var remainingTiles = [];

    while (i < pool.length) {
      tile = pool[i++];
      var prevValue = tile.value;
      tile.clear();
      // if only this one cleared tile cannot be solved
      if (!this.solveTile(tile)) {
        // restore its value
        tile.value = prevValue;
        remainingTiles.push(tile);
      } else {
        tile.clear();
      }
    }
    this.quality = Math.round(100 * (this.getEmptyTiles().length / (this.width * this.height)));
    return remainingTiles;
  }

  public breakDown(remainingTiles?) {
    var attempts = 0,
      tile,
      pool = remainingTiles || this.tiles.concat();

    this.tileToSolve = null;
    this.state.clear();
    //State.save('full');

    //console.log('items to solve', pool.length)

    if (!remainingTiles)
      Utils.shuffle(pool); // not shuffling increases this.quality!

    var i = 0;
    while (i < pool.length && attempts++ < 6) {
      tile = pool[i++];
      this.tileToSolve = tile;
      var clearedTile = tile,
        clearedTileValue = tile.value;
      tile.clear();
      this.state.save('breakdown');
      //console.log('save breakdown')
      if (this.solve()) {
        this.state.restore('breakdown');
        attempts = 0;
      } else {
        this.state.restore('breakdown');
        clearedTile.value = clearedTileValue;
      }
    }
    this.tileToSolve = null;
    this.state.save('empty');
    this.quality = Math.round(100 * (this.getEmptyTiles().length / (this.width * this.height)));

    // mark remaining this.tiles as system
    this.each((x, y, i, tile) => {

      if (!tile.isEmpty) {

        tile.system = true;
      }
    })
  }

  public getWrongTiles() {

    var wrongTiles: Tile[] = [];
    this.each((x, y, i, tile) => {
      var currentValue = tile.value,
        okValue = this.state.getValueForTile('full', x, y);
      if (currentValue > 0 && currentValue != okValue)
        wrongTiles.push(tile);
    });

    return wrongTiles;
  }

  public getValues() {
    var values = [];
    this.each((x, y, i, tile) => {

      values.push(tile.value)
    });
    return values;
  }

  static start(size: number) {

    const grid = new Grid(size);

    grid.load();
    grid.generateFast();

    let attempts = 0;
    let quality = 0;

    const qualityThreshold = {
      4: 60,
      6: 60,
      8: 60,
      10: 60
    };

    do {
      if (attempts > 0) {
        grid.clear();
        grid.state.restore('full')
      }
      grid.breakDown();
      quality = grid.quality;
    }
    while (quality < qualityThreshold[4] && attempts++ < 42);

    return grid;
  }
}
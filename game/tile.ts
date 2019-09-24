import { Grid } from './grid';
import { Hint, HintType } from './hint';
import * as $ from 'jquery';

const Directions = {
  Left: 'Left',
  Right: 'Right',
  Up: 'Up',
  Down: 'Down'
}

const reg0 = new RegExp('0', 'g');

export class Tile {

  public x: number;
  public y: number;
  public possibleValues: number[];
  public emptyColPairWith?: Tile;
  public emptyRowPairWith?: Tile;
  public id: string;
  public id1: string;
  public id2: string;
  public system: boolean;
  // public td: JQuery<HTMLElement>;

  public get isEmpty() {

    return this._value == 0;
  }

  constructor(
    private _value: number,
    private grid: Grid,
    private index: number) {

    this.x = index % grid.width;
    this.y = Math.floor(index / grid.width);
    this.possibleValues = [];
    this.emptyColPairWith = undefined; // other pair that this tile is an empty pair with
    this.emptyRowPairWith = undefined; // other pair that this tile is an empty pair with
    this.system = false;
    this.id = this.x + ',' + this.y;
    this.id1 = this.id + '=' + 1;
    this.id2 = this.id + '=' + 2;
    // this.td = $('<td></td>');
  }

  public clear() {

    this.value = 0;
  }

  private traverse(hor: number, ver: number) {
    var newX = this.x + hor,
      newY = this.y + ver;
    return this.grid.getTile(newX, newY);
  }

  private right() {
    return this.move(Directions.Right);
  };

  private left() {
    return this.move(Directions.Left);
  };

  private up() {
    return this.move(Directions.Up);
  };

  private down() {
    return this.move(Directions.Down);
  };

  private move(dir: string): Tile {
    switch (dir) {
      case Directions.Right:
        return this.traverse(1, 0);
      case Directions.Left:
        return this.traverse(-1, 0);
      case Directions.Up:
        return this.traverse(0, -1);
      default:
        return this.traverse(0, 1);
    }
  }

  public set value(v: number) {

    this._value = v;

    /* if (v === 1) {

      this.td.addClass('red');
      this.td.removeClass('blue');
    } else if (v === 2) {

      this.td.removeClass('red');
      this.td.addClass('blue');
    } else {

      this.td.removeClass('red');
      this.td.removeClass('blue');
    } */

    this.grid.setValue(this.x, this.y, this.index, v);
  }

  public get value() {

    return this._value;
  }

  private isPartOfTripleX() {
    var partOfTripleX = false,
      v = this._value;
    if (!v) return false;

    var l = Directions.Left, r = Directions.Right;

    partOfTripleX =
      (this.move(l)._value == v && this.move(l).move(l)._value == v) ||
      (this.move(r)._value == v && this.move(r).move(r)._value == v) ||
      (this.move(l)._value == v && this.move(r)._value == v);
    return partOfTripleX;
  }

  private isPartOfTripleY() {
    var partOfTripleY = false,
      v = this._value;
    if (!v) return false;
    var u = Directions.Up, d = Directions.Down;
    partOfTripleY =
      (this.move(u)._value == v && this.move(u).move(u)._value == v) ||
      (this.move(d)._value == v && this.move(d).move(d)._value == v) ||
      (this.move(u)._value == v && this.move(d)._value == v);
    return partOfTripleY;
  }

  private isPartOfTriple() {
    return this.isPartOfTripleX() || this.isPartOfTripleY();
  }

  public collect(hint: Hint) {
    if (this._value > 0)
      return this;

    this.possibleValues = [1, 2];
    this.emptyRowPairWith = undefined;
    this.emptyColPairWith = undefined;

    // first pass is to check four doubles, in betweens, and 50/50 row/col spread
    for (var v = 1; v <= 2; v++) {
      var opp = v == 1 ? 2 : 1;

      // check doubles and in betweens
      for (var dir in Directions) {
        if (this.move(dir)._value == v && this.move(dir).move(dir)._value == v) {
          this.possibleValues = [opp];

          // set the hint
          if (hint && hint.active)
            hint.mark(this, v == 2 ? HintType.MaxTwoBlue : HintType.MaxTwoRed);

          return this;
        }
      }

      if ((this.move(Directions.Left)._value == v && this.move(Directions.Right)._value == v) ||
        (this.move(Directions.Up)._value == v && this.move(Directions.Down)._value == v)) {
        this.possibleValues = [opp];

        // set the hint
        if (hint && hint.active)
          hint.mark(this, v == 2 ? HintType.MaxTwoBlue : HintType.MaxTwoRed);

        return this;
      }
    }

    // quick check for too many 1 or 2
    var rowInfo = this.grid.getRowInfo(this.y);
    if (rowInfo.nr1s >= this.grid.maxPerRow) {
      this.possibleValues = [2];
      if (hint && hint.active)
        hint.mark(this, HintType.RowMustBeBalanced);
      return this;
    }
    if (rowInfo.nr2s >= this.grid.maxPerRow) {
      this.possibleValues = [1];
      if (hint && hint.active)
        hint.mark(this, HintType.RowMustBeBalanced);
      return this;
    }
    if (rowInfo.nr0s == 2) {
      rowInfo.str.replace(reg0, (m, i) => {
        if (i != this.x)
          this.emptyRowPairWith = this.grid.getTile(i, this.y);
        return '';
      });
    }
    var colInfo = this.grid.getColInfo(this.x);
    if (colInfo.nr1s >= this.grid.maxPerCol) {
      this.possibleValues = [2];
      if (hint && hint.active)
        hint.mark(this, HintType.ColMustBeBalanced);
      return this;
    }
    if (colInfo.nr2s >= this.grid.maxPerCol) {
      this.possibleValues = [1];
      if (hint && hint.active)
        hint.mark(this, HintType.ColMustBeBalanced);
      return this;
    }
    if (colInfo.nr0s == 2) {
      colInfo.str.replace(reg0, (m, i) => {
        if (i != this.y)
          this.emptyColPairWith = this.grid.getTile(this.x, i);
        return '';
      });
    }

    return this;
  }
}
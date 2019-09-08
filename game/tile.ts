import { Grid } from './grid';

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
  public emptyColPairWith;
  public emptyRowPairWith;

  constructor(
    public value: number,
    public grid: Grid,
    public index: number) {

    this.x = index % grid.width;
    this.y = Math.floor(index / grid.width);
    this.possibleValues = [];
    this.emptyColPairWith = null, // other pair that this tile is an empty pair with
      this.emptyRowPairWith = null; // other pair that this tile is an empty pair with
  }

  public clear() {
    this.setValue(0);
  }

  public traverse(hor, ver) {
    var newX = this.x + hor,
      newY = this.y + ver;
    return this.grid.tile(newX, newY);
  }

  public right() {
    return this.move(Directions.Right);
  };

  public left() {
    return this.move(Directions.Left);
  };

  public up() {
    return this.move(Directions.Up);
  };

  public down() {
    return this.move(Directions.Down);
  };

  public move(dir: string) {
    switch (dir) {
      case Directions.Right:
        return this.traverse(1, 0);
      case Directions.Left:
        return this.traverse(-1, 0);
      case Directions.Up:
        return this.traverse(0, -1);
      case Directions.Down:
        return this.traverse(0, 1);
    }
  }

  public setValue(v) {
    this.value = v;
    this.grid.setValue(this.x, this.y, this.index, v);
    return this;
  }

  public isPartOfTripleX() {
    var partOfTripleX = false,
      v = this.value;
    if (!v) return false;

    var l = Directions.Left, r = Directions.Right;
    
    partOfTripleX =
      (this.move(l).value == v && this.move(l).move(l).value == v) ||
      (this.move(r).value == v && this.move(r).move(r).value == v) ||
      (this.move(l).value == v && this.move(r).value == v);
    return partOfTripleX;
  }

  public isPartOfTripleY() {
    var partOfTripleY = false,
      v = this.value;
    if (!v) return false;
    var u = Directions.Up, d = Directions.Down;
    partOfTripleY =
      (this.move(u).value == v && this.move(u).move(u).value == v) ||
      (this.move(d).value == v && this.move(d).move(d).value == v) ||
      (this.move(u).value == v && this.move(d).value == v);
    return partOfTripleY;
  }

  public isPartOfTriple() {
    return this.isPartOfTripleX() || this.isPartOfTripleY();
  }

  public collect(hint) {
    if (this.value > 0)
      return this;

    this.possibleValues = [1, 2];
    this.emptyRowPairWith = null;
    this.emptyColPairWith = null;

    // first pass is to check four doubles, in betweens, and 50/50 row/col spread
    for (var v = 1; v <= 2; v++) {
      var opp = v == 1 ? 2 : 1;

      // check doubles and in betweens
      for (var dir in Directions) {
        if (this.move(dir).value == v && this.move(dir).move(dir).value == v) {
          this.possibleValues = [opp];

          // set the hint
          if (hint && hint.active)
            hint.mark(this, v == 2 ? HintType.MaxTwoBlue : HintType.MaxTwoRed);

          return this;
        }
      }

      if ((this.move(Directions.Left).value == v && this.move(Directions.Right).value == v) ||
        (this.move(Directions.Up).value == v && this.move(Directions.Down).value == v)) {
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
      rowInfo.str.replace(reg0, function (m, i) {
        if (i != this.x)
          this.emptyRowPairWith = this.grid.tile(i, this.y);
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
      colInfo.str.replace(reg0, function (m, i) {
        if (i != this.y)
          this.emptyColPairWith = this.grid.tile(this.x, i);
      });
    }

    return this;
  }
}
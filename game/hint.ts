import { Grid } from "./grid";
import { Tile } from "./tile";

/* 
 * Hint
 * Basic hinting system for providing in-game help when a player gets stuck.
 * (c) 2014 Q42
 * http://q42.com | @q42
 * Written by Martin Kool
 * martin@q42.nl | @mrtnkl
 */
export const HintType = {
  None: 'None',
  RowsMustBeUnique: 'No two rows are the same.',
  ColsMustBeUnique: 'No two columns are the same.',
  RowMustBeBalanced: 'Rows have an equal number of each color.',
  ColMustBeBalanced: 'Columns have an equal number of each color.',
  MaxTwoRed: 'Three red tiles aren\'t allowed next to eachother.',
  MaxTwoBlue: 'Three blue tiles aren\'t allowed next to eachother.',
  SinglePossibleRowCombo: 'Only one combination is possible here.',
  SinglePossibleColCombo: 'Only one combination is possible here.',
  Error: 'This one doesn\'t seem right.',
  Errors: 'These don\'t seem right.'
};

export class Hint {

  public active: boolean;
  private visible: boolean;
  private info: {
    type: string;
    tile: Tile;
    tile2: Tile;
    doubleRowOrCol: number[]
  };
  public doubleColFound: number[];
  public doubleRowFound: number[];

  constructor(private grid: Grid) {

    this.active = false;
    this.visible = false;
    this.info = {
      type: HintType.None,
      tile: null,
      tile2: null,
      doubleRowOrCol: []
    };
    this.doubleColFound = [];
    this.doubleRowFound = [];
  }

  // private clear() {

  //   this.doubleColFound = [];
  //   this.doubleRowFound = [];
  //   this.hide();
  //   if (this.grid)
  //     this.grid.unmark();
  //   this.active = false;
  //   this.info = {
  //     type: HintType.None,
  //     tile: null,
  //     tile2: null,
  //     doubleRowOrCol: []
  //   }
  // }

  public mark(tile, hintType, tile2?, doubleRowOrCol?) {
    if (this.active) {
      //console.log('mark', hintType, doubleRowOrCol)
      //console.log('tiles', tile, tile2)
      this.info.tile = tile;
      this.info.tile2 = tile2 || null;
      this.info.type = hintType;
      this.info.doubleRowOrCol = doubleRowOrCol;
      return true;
    }
    return false;
  }

  // private next() {
  //   var wrongTiles = this.grid.getWrongTiles();

  //   if (wrongTiles.length) {

  //     if (wrongTiles.length == 1) {

  //       this.show(HintType.Error);
  //     } else {

  //       this.show(HintType.Errors);
  //     }

  //     return;
  //   }

  //   this.active = true;
  //   this.grid.solve(false, true);
  //   if (this.info.tile) {
  //     this.show(this.info.type);
  //     switch (this.info.type) {
  //       case HintType.RowMustBeBalanced:
  //         this.grid.markRow(this.info.tile.y);
  //         break;
  //       case HintType.ColMustBeBalanced:
  //         this.grid.markCol(this.info.tile.x);
  //         break;
  //       case HintType.RowsMustBeUnique:
  //         this.grid.markRow(this.info.tile.y);
  //         this.grid.markRow(this.info.doubleRowOrCol[0] != this.info.tile.y ? this.info.doubleRowOrCol[0] : this.info.doubleRowOrCol[1]);
  //         break;
  //       case HintType.ColsMustBeUnique:
  //         this.grid.markCol(this.info.tile.x);
  //         this.grid.markCol(this.info.doubleRowOrCol[0] != this.info.tile.x ? this.info.doubleRowOrCol[0] : this.info.doubleRowOrCol[1]);
  //         break;
  //       default:
  //         // if (this.info.tile2)
  //         //   this.info.tile2.mark();
  //         // this.info.tile.mark();
  //         break;
  //     }
  //   }
  // }

  private show(type) {
    this.visible = true;
  }

  private hide() {
    this.visible = false;
  }
};
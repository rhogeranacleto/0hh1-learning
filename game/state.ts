import { Grid } from "./grid";
import { Tile } from "./tile";

export class State {

  private saveSlots;
  private stateStack;
  public currentState;

  constructor(private grid: Grid) { 
    this.saveSlots = {};
  }

  public clear() {
    this.stateStack = {};
    this.currentState = this.stateStack;
  }

  // adds the changed tile to the stack
  public push(tile: Tile) {

    var id = tile.value == 1 ? tile.id1 : tile.id2;
    var newState = { 'parent': this.currentState, tile: tile };
    // add the new state on top of the current
    this.currentState[id] = newState;
    // for this specific tile, count how many values have been tried
    if (this.currentState[tile.id])
      this.currentState[tile.id]++
    else
      this.currentState[tile.id] = 1;
    this.currentState = newState;
  }

  public pop() {
    do {
      // clear the working on tile
      var tile = this.currentState.tile;
      tile.clear();
      this.currentState = this.currentState.parent;
    }
    while (this.currentState && this.currentState[tile.id] == 2)
  }

  public save(saveId: string, values?) {
    saveId = saveId || '1';
    var slot = { id: saveId, values: [], restoreCount: 0 };
    if (values) {
      for (var i = 0; i < values.length; i++)
        slot.values.push(values[i])
    }
    else {
      for (var i = 0; i < this.grid.tiles.length; i++)
        slot.values.push(this.grid.tiles[i].value);
    }
    this.saveSlots[saveId] = slot;
    return this;
  }

  public restore(saveId) {

    saveId = saveId || '1';
    var slot = this.saveSlots[saveId];
    slot.restoreCount++;
    for (var i = 0; i < slot.values.length; i++)
      this.grid.tiles[i].value = slot.values[i];
    return this;
  }

  public getValueForTile(saveId: string, x: number, y: number) {

    var slot = this.saveSlots[saveId];
    if (!slot)
      return -1;
    if (isNaN(y)) {
      let i = x;
      x = i % this.grid.width;
      y = Math.floor(i / this.grid.width);
    }
    return slot.values[y * this.grid.width + x];
  }
}
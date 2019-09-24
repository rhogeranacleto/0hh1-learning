function setup() {

  createCanvas(600, 1500);
  background('#fafafa');
  stroke('#cecece');
  noLoop();
}

const tileSize = 10;
const gridSize = 12;

function draw() {

  // clear();
  let gridTop = 0;
  let gridLeft = 0;

  for (let j = 0; j < grids.length; j++) {

    const grid = grids[j];

    gridLeft = 50 * (j % gridSize);
    gridTop = 50 * (Math.floor(j / gridSize));

    for (let i = 0; i < grid.tiles.length; i++) {

      const tile = grid.tiles[i];

      if (tile.value === 1) {
        fill('red');
      } else if (tile.value === 2) {
        fill('blue');
      } else {
        fill('white');
      }

      square(gridLeft + tileSize * (i % 4), gridTop + tileSize * Math.floor(i / 4), tileSize);
    }
  }
}
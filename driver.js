const puppeteer = require('puppeteer');

async function driver() {

  const browser = await puppeteer.launch({
    headless: false,
    // slowMo: 500,
    args: [`--window-size=200,650`],
    defaultViewport: {
      isMobile: true,
      width: 500,
      height: 500
    }
  });
  const pages = await browser.pages();
  const page = pages[0];

  await page.goto(`file://${__dirname}/0hh1/index.html`);
  await waitForGridReady();

  async function restart() {

    await page.evaluate(() => window.Game.startGame(Levels.getSize(4)));
  };

  function getInputs() {

    return page.evaluate(() => window.Game.grid.getValues());
  }

  function getRows() {

    return page.evaluate(() => window.Game.grid.info.rows);
  }

  function gameHasEnded(inputs) {

    return inputs.every(input => input > 0);
  }

  function isValid() {

    return page.evaluate(() => window.Game.grid.isValid());
  }

  async function clickOnTile(index, color) {

    const tiles = await page.$$('#board td .tile');
    // console.log(index, color)

    await tiles[index].click();

    if (color === 2) {

      return tiles[index].click();
    }
  }

  async function isTileWrong(index) {

    const wrongTiles = await page.evaluate(() => window.Game.grid.wrongTiles);

    return wrongTiles.some(tile => {

      const { x, y } = tile;

      return index === y * 4 + x;
    })
  }

  async function getTile(index) {

    const tiles = await page.evaluate(() => window.Game.grid.tiles);

    return tiles[index];
  }

  async function waitForGridReady() {

    return page.waitFor(() => window.Game.grid);
  }

  return {
    restart,
    getInputs,
    getRows,
    gameHasEnded,
    isValid,
    clickOnTile,
    isTileWrong,
    getTile,
    waitForGridReady
  };
}

module.exports = driver;
const puppeteer = require('puppeteer');
const { NeuralNetwork, Model, Academy } = require('reimprovejs/dist/reimprove.js');
const blessed = require('blessed');
const contrib = require('blessed-contrib');
const { reimprove } = require('./reimprove');

const screen = blessed.screen()
const line = contrib.line(
  {
    style:
    {
      line: "yellow",
      text: "green",
      baseline: "black"
    },
    xLabelPadding: 3,
    xPadding: 5,
    label: 'Title',
    showLegend: true
  });

const stepData = {
  title: 'steps',
  x: [],
  y: []
}
const acertoData = {
  title: 'acerto',
  x: [],
  y: [],
  style: {
    line: 'green'
  }
}
const systemData = {
  title: 'system',
  x: [],
  y: [],
  style: {
    line: 'blue'
  }
}
const errorData = {
  title: 'error',
  x: [],
  y: [],
  style: {
    line: 'red'
  }
}
// screen.append(line) //must append before setting data
line.setData([stepData])

screen.key(['escape', 'q', 'C-c'], function (ch, key) {
  return process.exit(0);
});

// screen.render();

(async () => {

  const browser = await puppeteer.launch({
    headless: false,
    // slowMo: 250,
    args: [`--window-size=200,650`],
    defaultViewport: {
      isMobile: true,
      width: 500,
      height: 500
    }
  });
  const pages = await browser.pages();
  const page = pages[0];

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

  async function clickOnTile(index) {

    const tiles = await page.$$('#board td .tile');

    // console.log('go click on', index);
    await tiles[index].click();
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

  const resolveGame = reimprove();

  while (false) {

    await page.goto(`file://${__dirname}/0hh1/index.html`);
    await resolveGame({
      waitForGridReady,
      getInputs,
      clickOnTile,
      isTileWrong,
      gameHasEnded,
      isValid,
      acertoData,
      stepData,
      errorData,
      getTile,
      finishedEpoch: () => {
        line.setData([stepData, acertoData, errorData]);
        screen.render();
      }
    });
  }
})();
const puppeteer = require('puppeteer');
const { NeuralNetwork, Model, Academy } = require('reimprovejs/dist/reimprove.js');

const blessed = require('blessed');
const contrib = require('blessed-contrib');
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
screen.append(line) //must append before setting data
line.setData([stepData])

screen.key(['escape', 'q', 'C-c'], function (ch, key) {
  return process.exit(0);
});

// const bar = contrib.stackedBar({
//   label: 'Steps (%)',
//   barWidth: 4,
//   barSpacing: 0,
//   xOffset: 0,
//   //, maxValue: 15,
//   // height: "100%",
//   // width: "50%",
//   barBgColor: ['red', 'blue', 'green']
// });
// screen.append(bar);

// let data = [];
// let category = [];
// bar.setData({
//   barCategory: category,
//   stackedCategory: ['Errado', 'System', 'Acerto'],
//   data
// });

// var lcd = contrib.lcd(
//   {
//     segmentWidth: 0.06 // how wide are the segments in % so 50% = 0.5
//     , segmentInterval: 0.11 // spacing between the segments in % so 50% = 0.550% = 0.5
//     , strokeWidth: 0.11 // spacing between the segments in % so 50% = 0.5
//     , elements: 4 // how many elements in the display. or how many characters can be displayed.
//     , display: 321 // what should be displayed before first call to setDisplay
//     , elementSpacing: 4 // spacing between each element
//     , elementPadding: 2 // how far away from the edges to put the elements
//     , color: 'white' // color for the segments
//     , label: 'Storage Remaining'
//   });

// screen.append(lcd);
screen.render();

(async () => {

  const browser = await puppeteer.launch({
    headless: false,
    // slowMo: 250,
    defaultViewport: {
      width: 390,
      height: 550
    }
  });
  const page = await browser.newPage();

  function getInputs() {

    return page.evaluate(() => window.Game.grid.getValues());
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

  const numActions = 15;                 // The number of actions your agent can choose to do
  const inputSize = 16;                // Inputs size (10x10 image for instance)
  const temporalWindow = 1;

  const network = new NeuralNetwork();

  network.InputShape = [inputSize * temporalWindow + numActions * temporalWindow + inputSize];

  network.addNeuralNetworkLayers([
    { type: 'dense', units: 32, activation: 'relu' },
    { type: 'dense', units: numActions, activation: 'softmax' }
  ]);

  const model = new Model.FromNetwork(network, {
    epochs: 1,
    stepsPerEpoch: 16
  });

  model.compile({ loss: 'meanSquaredError', optimizer: 'sgd' });

  const teacherConfig = {
    lessonsQuantity: 10,                   // Number of training lessons before only testing agent
    lessonsLength: 100,                    // The length of each lesson (in quantity of updates)
    lessonsWithRandom: 2,                  // How many random lessons before updating epsilon's value
    epsilon: 1,                            // Q-Learning values and so on ...
    epsilonDecay: 0.995,                   // (Random factor epsilon, decaying over time)
    epsilonMin: 0.05,
    gamma: 0.8                             // (Gamma = 1 : agent cares really much about future rewards)
  };

  const agentConfig = {
    model: model,                          // Our model corresponding to the agent
    agentConfig: {
      memorySize: 5000,                      // The size of the agent's memory (Q-Learning)
      batchSize: 128,                        // How many tensors will be given to the network when fit
      temporalWindow: 1         // The temporal window giving previous inputs & actions
    }
  };

  const academy = new Academy();    // First we need an academy to host everything
  const teacher = academy.addTeacher(teacherConfig);
  const agent = academy.addAgent(agentConfig);

  academy.assignTeacherToAgent(agent, teacher);

  let epoch = 0;

  async function resolveGame() {

    // console.log('EPOCH', epoch++);
    let steps = 0;
    let acerto = 0;
    let systemCount = 0;
    let erro = 0;
    await page.waitFor(() => window.Game.grid);
    let inputTiles = await getInputs();

    const system = inputTiles.map(input => input > 0);

    epoch++;

    do {

      steps++;

      let result = await academy.step([{
        teacherName: teacher,
        agentsInput: inputTiles
      }]);

      if (result) {

        const tileIndex = result.get(agent);

        if (system[tileIndex]) {

          academy.addRewardToAgent(agent, -1);
          erro++;
          continue;
        }

        await clickOnTile(tileIndex);

        const wrong = await isTileWrong(tileIndex);

        // console.log('acerto', valid)
        if (wrong) {
          erro++;
        } else {
          acerto++;
        }
        academy.addRewardToAgent(agent, wrong ? -1 : 1);
      }

      inputTiles = await getInputs();
    } while (!(gameHasEnded(inputTiles) && isValid()));

    // const gameValid = isValid();

    academy.addRewardToAgent(agent, 1);
    // console.log('Steps', steps)

    stepData.x = [...stepData.x, epoch];
    stepData.y = [...stepData.y, steps];
    acertoData.x = [...acertoData.x, epoch];
    acertoData.y = [...acertoData.y, acerto];
    // systemData.x = [...systemData.x, epoch];
    // systemData.y = [...systemData.y, systemCount];
    errorData.x = [...errorData.x, epoch];
    errorData.y = [...errorData.y, erro];

    line.setData([stepData, acertoData, errorData]);
    // lcd.setDisplay(steps.toString());

    // category.push(epoch.toString());
    // data.push([erro, systemCount, acerto]);

    // bar.setData({
    //   barCategory: category,
    //   stackedCategory: ['Errado', 'System', 'Acerto'],
    //   data
    // });
    screen.render();
  }

  while (true) {

    await page.goto(`file://${__dirname}/0hh1/index.html`);
    await resolveGame();
  }
})();
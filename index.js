const puppeteer = require('puppeteer');
const { NeuralNetwork, Model, Academy } = require('reimprovejs/dist/reimprove.js');

(async () => {

  const browser = await puppeteer.launch({ headless: false, slowMo: 250 });
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

      console.log(index, y, x, y * 4 + x)
      return index === y * 4 + x;
    })
  }

  const network = new NeuralNetwork();

  network.InputShape = [16];

  network.addNeuralNetworkLayers([
    { type: 'dense', units: 32, activation: 'relu' },
    { type: 'dense', units: 15, activation: 'softmax' }
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

    console.log('EPOCH', epoch++);
    let steps = 0;
    await page.waitFor(() => window.Game.grid);
    let inputTiles = await getInputs();

    do {

      steps++;

      let result = await academy.step([{
        teacherName: teacher,
        agentsInput: inputTiles
      }]);

      if (result) {

        const tileIndex = result.get(agent);

        await clickOnTile(tileIndex);
        const valid = await isTileWrong(tileIndex);

        // console.log('acerto', valid)
        academy.addRewardToAgent(agent, valid ? 1 : -1);
      }

      inputTiles = await getInputs();
    } while (!gameHasEnded(inputTiles));

    const gameValid = isValid();

    academy.addRewardToAgent(agent, gameValid ? 1 : -1);
    console.log('Steps', steps);
  }

  while (true) {

    await page.goto('file:///home/rhogeranacleto/jjs/0hh1-learning/0hh1/index.html');
    await resolveGame();
  }
})();
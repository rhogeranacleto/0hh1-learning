const { NeuralNetwork, Model, Academy } = require('reimprovejs/dist/reimprove.js');

function reimprove() {

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
    gamma: 1                             // (Gamma = 1 : agent cares really much about future rewards)
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

  return async function resolveGame({ waitForGridReady, getInputs, clickOnTile, isTileWrong, gameHasEnded, isValid, acertoData, stepData, errorData, finishedEpoch, getTile }) {

    // console.log('EPOCH', epoch++);
    let steps = 0;
    let acerto = 0;
    let systemCount = 0;
    let erro = 0;

    await waitForGridReady();

    let inputTiles = await getInputs();

    const system = inputTiles.map(input => input > 0);

    epoch++;

    do {

      steps++;

      let result = await academy.step([{
        teacherName: teacher,
        agentsInput: inputTiles
      }]);

      // if (result) {

      const tileIndex = result.get(agent);

      if (system[tileIndex]) {

        academy.addRewardToAgent(agent, -0.1);
        erro++;
        continue;
      }

      await clickOnTile(tileIndex);

      const tile = await getTile(tileIndex);
      const isWrong = await isTileWrong(tileIndex);

      // console.log('acerto', valid)

      if (isWrong) {
        erro++;
      } else {
        acerto++;
      }

      academy.addRewardToAgent(agent, tile.value === 0 ? -0.8 : isWrong ? -0.4 : 1);
      // }

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

    finishedEpoch();
  }
}

module.exports.reimprove = reimprove;
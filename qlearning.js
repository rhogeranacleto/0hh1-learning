require('./util');
require('./convnet');
const deepqlearn = require('./deepqlearn');
const driver = require('./driver');

const inputsCount = 16;
const actionCount = inputsCount * 2;
const temporalWindow = 1;

const networksize = inputsCount * temporalWindow + actionCount * temporalWindow + inputsCount;

const layer_defs = [];

layer_defs.push({ type: 'input', out_sx: 1, out_sy: 1, out_depth: networksize });
layer_defs.push({ type: 'fc', num_neurons: 50, activation: 'relu' });
layer_defs.push({ type: 'fc', num_neurons: 50, activation: 'relu' });
layer_defs.push({ type: 'regression', num_neurons: actionCount });

const tdtrainer_options = {
  learning_rate: 0.01,
  momentum: 0.0,
  batch_size: 64,
  l2_decay: 0.01
};

const opt = {
  temporal_window: temporalWindow,
  experience_size: 30000,
  start_learn_threshold: 1000,
  gamma: 0.7,
  learning_steps_total: 200000,
  learning_steps_burnin: 3000,
  epsilon_min: 0.05,
  epsilon_test_time: 0.05,
  layer_defs: layer_defs,
  tdtrainer_options: tdtrainer_options
};

const brain = new deepqlearn.Brain(inputsCount, actionCount, opt); // woohoo

let times = 0;
let plus = 0;
let record = 0;

async function ai(total = 5000) {

  const game = await driver();

  let ended = false;

  do {

    times++;

    const inputs = await game.getInputs();

    // console.log(inputs);
    const action = brain.forward(inputs);

    let index = action >= 16 ? action - 16 : action;
    let color = action >= 16 ? 2 : 1;

    let isValid = true;
    let reward;

    if (inputs[index] === 0) {

      await game.clickOnTile(index, color);

      isValid = await game.isValid();

      reward = isValid ? 1 : -1;
    } else {

      reward = -0.6
    }

    brain.backward(reward);

    if (!isValid) {

      await game.restart();
      record = Math.max(record, plus)
      plus = 0;

      console.log('Record', record);
      continue;
    } else {

      plus++;

      ended = await game.gameHasEnded(inputs);

      if (ended) {

        console.log('TERMINOU!');
      }
    }
  } while (!ended && times < total);

  return game;
}

ai(4000).then(async game => {

  console.log('trienou');

  brain.epsilon_test_time = 0.0; // don't make any random choices, ever
  brain.learning = false;

  await game.restart();

  let isValid = await game.isValid();

  while (isValid) {

    const inputs = await game.getInputs();
    const action = brain.forward(inputs);

    let index = action >= 16 ? action - 16 : action;
    let color = action >= 16 ? 2 : 1;

    if (inputs[index] === 0) {

      console.log('click on', index, color);

      await game.clickOnTile(index, color);

      isValid = await game.isValid();
    }
  }

  console.log('Isso foi tudo que ele conseguiu fazer')
})
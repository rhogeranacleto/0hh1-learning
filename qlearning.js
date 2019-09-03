require('./util');
require('./convnet');
const deepqlearn = require('./deepqlearn');
const driver = require('./driver');
const plotly = require('plotly')('rhoger.anacleto', 'ZAtrKc2j17ztdIx2nzVC');

var initData = [
  // {
  //   x: [],
  //   y: [],
  //   stream: {
  //     token: 'gx76qwqcqi'
  //   },
  //   fill: "tozeroy",
  //   type: "scatter"
  // },
  {
    x: [],
    y: [],
    stream: {
      token: 'h21mxgy8c8'
    },
    fill: "tonexty",
    type: "scatter"
  }];

var initGraphOptions = {
  fileopt: "overwrite",
  filename: "ai"
};

function plot() {

  return new Promise((resolve, reject) => {

    plotly.plot(initData, initGraphOptions, function (err, msg) {

      if (err) return reject(err)

      // var stream1 = plotly.stream('gx76qwqcqi', function (err, res) {
      //   console.log(err, res);
      // });

      var stream2 = plotly.stream('h21mxgy8c8', function (err, res) {
        console.log(err, res);
      });

      return resolve({
        msg,
        // stream1,
        stream2
      });
    });
  })
}

const inputsCount = 16;
const actionCount = inputsCount * 2;
const temporalWindow = 1;

const networksize = inputsCount * temporalWindow + actionCount * temporalWindow + inputsCount;

const layer_defs = [];

layer_defs.push({ type: 'input', out_sx: 1, out_sy: 1, out_depth: networksize });
layer_defs.push({ type: 'fc', num_neurons: 50, activation: 'relu' });
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
  epsilon_min: 0.01,
  epsilon_test_time: 0.05,
  layer_defs: layer_defs,
  tdtrainer_options: tdtrainer_options
};

const brain = new deepqlearn.Brain(inputsCount, actionCount, opt); // woohoo

let times = 0;
let plus = 0;
let record = 0;
let attemptive = 0;

async function ai(total = 5000) {

  const { msg, stream2 } = await plot();

  // console.log(msg);

  const game = await driver();

  let ended = false;
  let epoch = 0;

  async function finalizeEpoch() {

    // var streamObject = JSON.stringify({ x: times, y: attemptive });
    // stream1.write(streamObject + '\n');
    var streamObject2 = JSON.stringify({ x: epoch++, y: plus });
    stream2.write(streamObject2 + '\n');

    await game.restart();

    plus = 0;
    attemptive = 0;
  }

  do {

    // times++;
    attemptive++;

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

      reward = -0.7
    }

    brain.backward(reward);

    if (!isValid) {

      await finalizeEpoch();
    } else {

      plus++;

      ended = await game.gameHasEnded(inputs);

      if (ended) {

        await finalizeEpoch();
      }
    }
  } while (epoch < total);

  return game;
}

ai(3000).then(async game => {

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
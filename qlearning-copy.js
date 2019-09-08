
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
  learning_rate: 0.015,
  momentum: 0.0,
  batch_size: 64,
  l2_decay: 0.01
};

const opt = {
  temporal_window: temporalWindow,
  experience_size: 50000,
  start_learn_threshold: 1000,
  gamma: 0.8,
  learning_steps_total: 200000,
  learning_steps_burnin: 3000,
  epsilon_min: 0.05,
  epsilon_test_time: 0.01,
  layer_defs: layer_defs,
  tdtrainer_options: tdtrainer_options
};

var ctx = document.getElementById('myChart');
var myChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      label: 'epoch',
      data: [],
      borderWidth: 1
    }]
  },
  options: {
    // scales: {
    //     yAxes: [{
    //         ticks: {
    //             beginAtZero: true
    //         }
    //     }]
    // }
    animation: false,
    elements: {
      // point: false,
      line: {
        tension: 0, // disables bezier curves
        backgroundColor: '#3b9a98',
      }
    },
    hover: {
      animationDuration: 0 // duration of animations when hovering an item
    },
    responsiveAnimationDuration: 0
  }
});

const brain = new deepqlearn.Brain(inputsCount, actionCount, opt); // woohoo

let times = 0;
let limit = 20000;
let attemptive = 0;
let completed = 0;

function ai() {

  const inputs = Game.grid.getValues();

  const action = brain.forward(inputs);

  let index = action >= 16 ? action - 16 : action;
  let color = action >= 16 ? 2 : 1;

  let reward = 0;
  let isValid = true;

  if (Game.grid.tiles[index].value > 0) {

    reward = -0.3;
  } else {
    attemptive++;

    Game.grid.tiles[index].value = color;

    isValid = Game.grid.isValid();

    reward += isValid ? 0.8 : -0.7;
  }

  brain.backward(reward);

  if (!isValid) {

    times++

    if (times % 100 == 0) {

      myChart.data.labels.push(times);
      myChart.data.datasets[0].data.push(attemptive / 100);
      attemptive = 0;
      myChart.update();
    }

    Game.startGame(Levels.getSize(4));
  } else if (Game.grid.emptyTileCount === 0) {

    completed++;
    console.log('Completed', completed, 'on time', times);
    Game.startGame(Levels.getSize(4));
  }

  if (times < limit) {
    brain.visSelf(document.getElementById('boardsize'))
    return requestAnimationFrame(ai);
  }
}

function testGame() {

  const inputs = Game.grid.getValues();

  const action = brain.forward(inputs);

  let index = action >= 16 ? action - 16 : action;
  let color = action >= 16 ? 2 : 1;

  if (Game.grid.tiles[index].system) {

    return 'nao pode ' + index + ':' + color;
  } else {

    Game.grid.tiles[index].value = color;

    return Game.grid.isValid();
  }
}
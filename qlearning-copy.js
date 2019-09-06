
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
let limit = 1000;

function ai() {

  const inputs = Game.grid.getValues();

  const action = brain.forward(inputs);

  let index = action >= 16 ? action - 16 : action;
  let color = action >= 16 ? 2 : 1;

  Game.grid.tiles[index].value = color;

  const isValid = Game.grid.isValid();

  brain.backward(isValid ? 0.7 : -1);

  if (!isValid) {

    times++;
    Game.startGame(Levels.getSize(4));
  }

  if (Game.grid.emptyTileCount > 0 && times < limit) {

    return requestAnimationFrame(ai);
  }
}

var ctx = document.getElementById('myChart');
var myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [{
            label: '# of Votes',
            data: [12, 19, 3, 5, 2, 3],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        }
    }
});
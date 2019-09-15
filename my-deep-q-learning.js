const learningRate = 0.85;
const discountFavor = 0.9;
const randomize = 0.05;

const inputSize = 16;
const outputSize = inputSize * 2;

function whichTable(currentState) {

  const key = currentState.join();

  if (!qtable[key]) {

    qtable[key] = new Array(outputSize).fill(0);
  }

  return qtable[key];
}

function getBestAction(currentState) {

  const q = whichTable(currentState);

  const maxValue = q.reduce((max, current) => max > current ? max : current, q[0]);
  const maxAction = q.indexOf(maxValue);

  if (Math.random() < randomize || maxValue === 0) {

    return Math.floor(Math.random() * outputSize);
  }

  return maxAction;
}

function updateQTable(state0, state1, reward, action) {

  const q0 = whichTable(state0);
  const q1 = whichTable(state1);

  const newValue = reward + discountFavor * Math.max(...q1) - q0[action];

  qtable[state0.join()][action] = q0[action] + learningRate * newValue;
}

let times = 0;
let limit = 20000;
let attemptive = 0;
let completed = 0;

function Algorithm() {

  const currentState = Game.grid.getValues();

  const action = getBestAction(currentState);

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

  const nextState = Game.grid.getValues();

  updateQTable(currentState, nextState, reward, action);

  if (!isValid) {

    times++;

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

    return requestAnimationFrame(Algorithm);
  }
}

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
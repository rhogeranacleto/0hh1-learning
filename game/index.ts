import { Grid } from './grid';
import { NeuralNetwork } from './neural-network';
import * as tf from '@tensorflow/tfjs';
import { Agent } from './agent';
import { playGame } from './generation';

// @ts-ignore
// const ModelView = require('tfjs-model-view');
tf.setBackend('cpu');

const grids: Grid[] = [];

for (let i = 0; i < 250; i++) {

  const grid = new Grid(4);
  grids.push(grid);
  grid.init();
  const neural = new NeuralNetwork(16, 50, 32);
  neural.model=neural.createModel()
  Agent.agents.push(new Agent(grid, neural));
}

const nn = new NeuralNetwork(16, 50, 32);

(window as any).grids = grids;
(window as any).gg = {
  tf,
  playGame,
  nn,
  Agent,
  Grid
};
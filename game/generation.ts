import { Agent } from "./agent";
import * as $ from 'jquery';

let epoch = 0;
let bestScore = 0;

export function playGame(): any {
  // @ts-ignore
  redraw();

  for (const agent of Agent.agents) {

    if (!agent.finished) {

      agent.think();
    }
  }

  if (Agent.agents.some(agent => !agent.finished)) {

    return requestAnimationFrame(() => playGame());
  }

  requestAnimationFrame(() => {
    nextGeneration();
    playGame();
  });
}

function nextGeneration() {

  $('#epoch').text(`Epoch ${epoch++}`);
  bestScore = Math.max(bestScore, ...Agent.agents.map(agent => agent.score));
  $('#score').text(`Best Score ${bestScore}`);

  calculateFitness();

  const newAgents = [];

  for (const agent of Agent.agents) {

    const newAgent = pickOne();
    newAgent.grid = agent.grid;
    newAgent.grid.clear();
    newAgent.grid.init();
    newAgents.push(newAgent);
  }

  for (const agent of Agent.agents) {

    agent.brain.dispose();
  }

  Agent.agents = newAgents;
}

function pickOne() {

  let index = 0;
  let r = Math.random();

  while (r > 0) {

    r = r - Agent.agents[index].fitness;
    index++;
  }

  index--;

  let parent = Agent.agents[index];
  const child = new Agent(parent.grid, parent.brain.copy());

  child.brain.mutate(0.1);

  return child;
}

function calculateFitness() {

  const sum = Agent.agents.reduce((total, agent) => total + agent.score, 0);

  for (const agent of Agent.agents) {

    agent.fitness = agent.score / sum;
  }
}
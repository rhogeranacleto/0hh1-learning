import { Grid } from "./grid";
import { NeuralNetwork } from "./neural-network";

export class Agent {

  public finished: boolean;
  public score: number;
  public fitness: number;

  public static agents: Agent[] = [];

  constructor(
    public grid: Grid,
    public brain: NeuralNetwork
  ) { 

    this.finished = false;
    this.score = 0;
    this.fitness = 0;
  }

  public think() {

    const inputs = this.grid.getValues();

    const output: number[] = this.brain.predict(inputs) as any;

    const maxValue = (output).reduce<number>((max, current) => current > max ? current : max, output[0]);

    const outputIndex = output.indexOf(maxValue);
    const index = outputIndex >= 16 ? outputIndex - 16 : outputIndex;
    const color = outputIndex >= 16 ? 2 : 1;

    if (this.grid.tiles[index].value === 0) {
  
      this.grid.tiles[index].value = color;

      if (this.grid.isValid()) {
     
        this.score++;
      } else {
        
        this.finished = true;
      }
    } else {
      
      this.finished = true;
    }
  }
}
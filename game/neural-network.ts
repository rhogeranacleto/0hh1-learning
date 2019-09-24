import * as tf from '@tensorflow/tfjs';
import { randomGaussian } from './random';

export class NeuralNetwork {

  public model!: tf.Sequential;

  constructor(
    private inputNodes: number,
    private hiddenNodes: number,
    private outputNodes: number
  ) { }

  public createModel() {

    const model = tf.sequential();

    const hidden = tf.layers.dense({
      units: this.hiddenNodes,
      inputShape: [this.inputNodes],
      activation: 'relu'
    });

    model.add(hidden);

    const output = tf.layers.dense({
      units: this.outputNodes,
      activation: 'softmax'
    });

    model.add(output);

    return model;
  }

  public copy() {

    let nn = new NeuralNetwork(this.inputNodes, this.hiddenNodes, this.outputNodes);

    tf.tidy(() => {

      const modelCopy = this.createModel();
      const weights = this.model.getWeights();
      const weightsCopy = weights.map(weight => weight.clone());
      modelCopy.setWeights(weightsCopy);

      nn.model = modelCopy;
    });

    return nn;
  }

  public dispose() {
    
    this.model.dispose();
  }

  public mutate(rate: number) {

    tf.tidy(() => {

      const weights = this.model.getWeights();
      const mutatedWeights = [];

      for (let i = 0; i < weights.length; i++) {

        const tensor = weights[i];
        const shape = tensor.shape;
        const values = tensor.dataSync().slice();

        for (let j = 0; j < values.length; j++) {

          if (Math.random() < rate) {

            const value = values[j];

            values[j] = value + randomGaussian();
          }
        }

        const newTensor = tf.tensor(values, shape);
        mutatedWeights[i] = newTensor;
      }

      this.model.setWeights(mutatedWeights);
    });
  }

  public predict(inputs: number[]) {

    return tf.tidy(() => {

      const xs = tf.tensor2d([inputs]);
      const ys = this.model.predict(xs);

      return Array.isArray(ys) ? ys.map(y => y.dataSync()) : ys.dataSync();
    });
  }
}
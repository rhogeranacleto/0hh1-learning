const tf = require('@tensorflow/tfjs-node');

const model = tf.sequential();

model.add(tf.layers.dense({
  units: 32,
  activation: 'elu',
  inputShape: [4, 4, 4, 4]
}));

model.add(tf.layers.dense({
  units: 32,
  activation: 'elu'
}));

model.add(tf.layers.dense({
  units: 2,
  // activation: 'sigmoid',
  // inputShape: [16]
}));

model.compile({
  loss: 'meanSquaredError',
  optimizer: tf.train.adam(0.1)
});

function getStateTensor(inputs) {

  return tf.tensor2d([inputs]);
}


async function tensorflow({ getInputs, getRows }) {

  // for (let i = 0; i < 5; i++) {

  // for (let j = 0; j < 100; j++) {

  const inputs = await getInputs();
  const stateTensor = await tf.tensor2d(inputs, [4, 4]).print();

  await model.fit(stateTensor, tf.tensor2d([]));

  // model.predict()
  // }
  // }
}

tensorflow({
  getInputs: () => [0, 0, 0, 0, 1, 0, 0, 0, 0, 2, 0, 1, 0, 0, 0, 1]
})
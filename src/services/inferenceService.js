const tf = require("@tensorflow/tfjs-node");
const InputError = require("../exceptions/InputError");

async function predictClassification(model, image) {
  try {
    const tensor = tf.node
      .decodeJpeg(image)
      .resizeNearestNeighbor([224, 224])
      .expandDims()
      .toFloat();

    const prediction = model.predict(tensor);
    const score = await prediction.data();
    const confidenceScore = Math.max(...score) * 100;

    const label = confidenceScore > 50 ? "Cancer" : "Non-cancer";

    let suggestion;

    if (label === "Cancer") {
      suggestion = "Segera periksa ke dokter!";
    }

    if (label === "Non-cancer") {
      suggestion = "Penyakit kanker tidak terdeteksi.";
    }

    return { label, suggestion, confidenceScore };
  } catch (error) {
    throw new InputError(`Terjadi kesalahan input: ${error.message}`);
  }
}

module.exports = predictClassification;

const predictClassification = require("../services/inferenceService");
const crypto = require("crypto");
const storeData = require("../services/storeData");

async function postPredictHandler(request, h) {
  const { image } = request.payload;
  const { model } = request.server.app;

  const { label, suggestion, confidenceScore } = await predictClassification(
    model,
    image
  );
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  const data = {
    id: id,
    result: label,
    suggestion: suggestion,
    createdAt: createdAt,
  };

  const response = h.response({
    status: "success",
    message: "Model is predicted successfully",
    data,
  });

  await storeData(id, data);

  response.code(201);
  return response;
}

async function predictHistories(request, h) {
  const { model } = request.server.app;
  const { Firestore } = require("@google-cloud/firestore");
  const db = new Firestore({
    projectId: "asclepius-443800",
  });
  const predictCollection = db.collection("predictions");
  const snapshot = await predictCollection.get();
  const result = [];
  snapshot.forEach((doc) => {
    result.push({
      id: doc.id,
      history: {
        result: doc.data().result,
        createdAt: doc.data().createdAt,
        suggestion: doc.data().suggestion,
        id: doc.data().id,
      },
    });
  });
  return h.response({
    status: "success",
    data: result,
  });
}

module.exports = { postPredictHandler, predictHistories };

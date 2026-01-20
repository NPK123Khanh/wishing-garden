// netlify/functions/getWishes.js
const admin = require("firebase-admin");

exports.handler = async () => {
  const db = admin.firestore();

  const snapshot = await db
    .collection("wishes")
    .orderBy("created_at", "desc")
    .limit(3)
    .get();

  const wishes = [];
  snapshot.forEach(doc => {
    wishes.push(doc.data());
  });

  return {
    statusCode: 200,
    body: JSON.stringify({ wishes })
  };
};

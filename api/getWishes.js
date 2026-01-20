const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

const db = admin.firestore();

module.exports = async (req, res) => {
  try {
    const snapshot = await db
      .collection("wishes")
      .orderBy("created_at", "desc")
      .limit(3)
      .get();

    const wishes = [];
    snapshot.forEach(doc => wishes.push(doc.data()));

    res.status(200).json({ wishes });
  } catch (err) {
    console.error("getWishes error:", err);
    res.status(500).json({ error: err.message });
  }
};

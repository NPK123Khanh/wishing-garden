const admin = require("firebase-admin");

// 🔹 Initialize ONLY ONCE (important for Netlify)
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

exports.handler = async () => {
  try {
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
      body: JSON.stringify({ wishes }),
    };

  } catch (err) {
    console.error("getWishes error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};

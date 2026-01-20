const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
    })
  });
}

const db = admin.firestore();

exports.handler = async (event) => {
  try {
    const { text } = JSON.parse(event.body);

    await db.collection("wishes").add({
      text: text,
      created_at: new Date()
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };

  } catch (err) {
    console.error("Save error:", err);

    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: "Save failed" })
    };
  }
};

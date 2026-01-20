const fetch = require("node-fetch");

exports.handler = async (event) => {
  try {
    const { text } = JSON.parse(event.body);

    const response = await fetch(
      "https://api-inference.huggingface.co/models/unitary/toxic-bert",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ inputs: text })
      }
    );

    const result = await response.json();
    console.log("HF RAW RESULT:", JSON.stringify(result, null, 2));


    // Hugging Face returns an array of labels with scores
    // We reject if toxicity > 0.7
    const scores = result[0];
    const toxic = scores.find(s => s.label === "toxic");

    const isOk = !toxic || toxic.score < 0.7;

    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: isOk,
        scores: scores
      })
    };

  } catch (err) {
    console.error("QC error:", err);

    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: "QC failed" })
    };
  }
};


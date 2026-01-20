const fetch = require("node-fetch");

const HF_API_URL = "https://router.huggingface.co/hf-inference/models/unitary/toxic-bert";
const HF_TOKEN = process.env.HF_TOKEN;

module.exports = async (req, res) => {
  try {
    const { text } = req.body;

    const response = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: text }),
    });

    const result = await response.json();

    console.log("HF RAW RESULT:", JSON.stringify(result));

    if (result.error) {
      return res.status(500).json({ ok: false, error: result.error });
    }

    const predictions = result[0];
    const toxic = predictions.find(p => p.label === "toxic");
    const isBad = toxic && toxic.score > 0.7;

    res.status(200).json({ ok: !isBad, predictions });

  } catch (err) {
    console.error("QC error:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
};

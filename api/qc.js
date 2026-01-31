
const HF_API_URL = "https://router.huggingface.co/hf-inference/models/unitary/toxic-bert";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text } = req.body;

  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Invalid text" });
  }

  try {
    const hfRes = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HF_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: text })
    });

    if (!hfRes.ok) {
      const errText = await hfRes.text();
      console.error("HF HTTP ERROR:", hfRes.status, errText);
      return res.status(500).json({ error: "HF request failed" });
    }

    const data = await hfRes.json();

    // Handle model loading case
    if (data?.error) {
      console.error("HF MODEL ERROR:", data.error);
      return res.status(503).json({ error: "Model loading" });
    }

    const toxicScore =
      data?.[0]?.find(r => r.label === "toxic")?.score || 0;

    return res.status(200).json({
      toxic: toxicScore > 0.7,
      score: toxicScore
    });

  } catch (err) {
    console.error("QC CRASH:", err);
    return res.status(500).json({ error: "Moderation failed" });
  }
}

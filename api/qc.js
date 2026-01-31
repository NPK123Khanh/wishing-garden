
const HF_API_URL = "https://router.huggingface.co/hf-inference/models/unitary/toxic-bert";
const HF_TOKEN = process.env.HF_TOKEN;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text } = req.body;

  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Invalid text" });
  }

  try {
    const hfRes = await fetch( HF_API_URL,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ inputs: text })
      }
    );

    const data = await hfRes.json();

    const toxicScore =
      data?.[0]?.find(r => r.label === "toxic")?.score || 0;

    return res.status(200).json({
      toxic: toxicScore > 0.7,
      score: toxicScore
    });

  } catch (err) {
    console.error("HF error:", err);
    return res.status(500).json({ error: "Moderation failed" });
  }
}


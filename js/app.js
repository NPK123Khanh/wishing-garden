// Get elements
const addBtn = document.getElementById("addWishBtn");
const input = document.getElementById("wishInput");
const wishList = document.getElementById("wish-list");
const errorMsg = document.getElementById("errorMsg");

// List of banned words (customize this)
const HF_API_TOKEN = "YOUR_HUGGINGFACE_TOKEN_HERE";

async function checkWithHuggingFace(text) {
  const response = await fetch(
    "https://api-inference.huggingface.co/models/unitary/toxic-bert",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_API_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: text })
    }
  );

  const result = await response.json();

  // Example result format:
  // [[{label: "toxic", score: 0.92}, {label: "insult", score: 0.85}, ...]]

  if (!Array.isArray(result) || !Array.isArray(result[0])) {
    // Model still loading or error → allow by default
    return { ok: true, reason: "model_not_ready" };
  }

  const labels = result[0];

  let toxicScore = 0;
  let insultScore = 0;

  labels.forEach(item => {
    if (item.label === "toxic") toxicScore = item.score;
    if (item.label === "insult") insultScore = item.score;
  });

  // You can tune these thresholds
  if (toxicScore > 0.7 || insultScore > 0.7) {
    return { ok: false, reason: "toxic" };
  }

  return { ok: true };
}


// Handle click
addBtn.addEventListener("click", async () => {
  const text = input.value.trim();

  if (text === "") {
    errorMsg.textContent = "Please write something first.";
    return;
  }

  errorMsg.textContent = "Checking content quality...";

  let qcResult;
  try {
    qcResult = await checkWithHuggingFace(text);
  } catch (e) {
    console.error("QC error:", e);
    errorMsg.textContent = "Quality check failed. Try again.";
    return;
  }

  if (!qcResult.ok) {
    errorMsg.textContent = "Your wish contains inappropriate content.";
    return;
  }

  errorMsg.textContent = "";

  try {
    await saveWishToDB(text);
  } catch (e) {
    console.error("Save error:", e);
    errorMsg.textContent = "Failed to save wish.";
    return;
  }

  const wishItem = document.createElement("div");
  wishItem.className = "wish-item";
  wishItem.textContent = text;

  wishList.prepend(wishItem);
  input.value = "";
});





async function saveWishToDB(text) {
  await db.collection("wishes").add({
    text: text,
    created_at: new Date()
  });
}


async function loadWishes() {
  const snapshot = await db
    .collection("wishes")
    .orderBy("created_at", "desc")
    .get();

  snapshot.forEach(doc => {
    const data = doc.data();

    const wishItem = document.createElement("div");
    wishItem.className = "wish-item";
    wishItem.textContent = data.text;

    wishList.appendChild(wishItem);
  });
}


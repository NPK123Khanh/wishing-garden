const addBtn = document.getElementById("addWishBtn");
const input = document.getElementById("wishInput");
const wishList = document.getElementById("wish-list");
const errorMsg = document.getElementById("errorMsg");

// Simple local bad word list (fast pre-filter)
const badWords = ["stupid", "hate", "fuck", "shit"];

function containsBadWord(text) {
  const lowerText = text.toLowerCase();
  return badWords.some(word => lowerText.includes(word));
}

addBtn.addEventListener("click", async () => {
  const text = input.value.trim();

  if (text === "") {
    errorMsg.textContent = "Please write something first.";
    return;
  }

  if (containsBadWord(text)) {
    errorMsg.textContent = "Your wish contains inappropriate words.";
    return;
  }

  errorMsg.textContent = "Checking quality...";

  // 1. Call AI QC
  let qcResult;
  try {
    const res = await fetch("/.netlify/functions/qc", {
      method: "POST",
      body: JSON.stringify({ text })
    });

    qcResult = await res.json();
  } catch (e) {
    console.error(e);
    errorMsg.textContent = "AI quality check failed.";
    return;
  }

  if (!qcResult.ok) {
    errorMsg.textContent = "Your wish was rejected by AI moderation.";
    return;
  }

  // 2. Save to DB
  try {
    const res = await fetch("/.netlify/functions/addWish", {
      method: "POST",
      body: JSON.stringify({ text })
    });

    const result = await res.json();

    if (!result.success) {
      throw new Error("Save failed");
    }

  } catch (e) {
    console.error(e);
    errorMsg.textContent = "Failed to save wish.";
    return;
  }

  // 3. Render on screen
  const wishItem = document.createElement("div");
  wishItem.className = "wish-item";
  wishItem.textContent = text;

  wishList.prepend(wishItem);
  input.value = "";
  errorMsg.textContent = "";
});

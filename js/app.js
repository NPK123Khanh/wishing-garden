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

// 🔹 LOAD 3 MOST RECENT WISHES WHEN PAGE OPENS
window.addEventListener("DOMContentLoaded", () => {
  loadWishes();
});

// 🔹 ADD WISH HANDLER
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
    const res = await fetch("/api/qc", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
    const res = await fetch("/api/addWish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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

  // 3. Render on screen (NEW WISH ON TOP)
  const wishItem = document.createElement("div");
  wishItem.className = "wish-item";
  wishItem.textContent = text;

  wishList.prepend(wishItem);

  // 🔹 Keep only: new wish + 3 old = max 4
  while (wishList.children.length > 4) {
    wishList.removeChild(wishList.lastChild);
  }

  input.value = "";
  errorMsg.textContent = "";
});

// 🔹 LOAD ONLY 3 MOST RECENT FROM DATABASE
async function loadWishes() {
  try {
    const res = await fetch("/api/getWishes");
    const data = await res.json();

    wishList.innerHTML = "";

    data.wishes.forEach(wish => {
      const wishItem = document.createElement("div");
      wishItem.className = "wish-item";
      wishItem.textContent = wish.text;

      wishList.appendChild(wishItem);
    });

  } catch (e) {
    console.error("Failed to load wishes:", e);
  }
}


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

// 🔹 LOAD ONLY 3 MOST RECENT FROM DATABASE


async function loadWishes() {
  const snapshot = await db
    .collection("wishes")
    .orderBy("created_at", "desc")
    .limit(6)
    .get();

  const wishes = [];
  snapshot.forEach(doc => wishes.push(doc.data()));

  for (let i = 0; i < 6; i++) {
    const box = document.getElementById(`wish-${i + 1}`);

    if (wishes[i]) {
      box.textContent = wishes[i].text;
      box.style.display = "block";
      fitText(box, 12, 28);
    } else {
      box.textContent = "";
      box.style.display = "none";
    }
  }
}




function fitText(element, min = 12, max = 28) {
  let size = max;
  element.style.fontSize = size + "px";

  while (size > min && element.scrollHeight > element.clientHeight) {
    size--;
    element.style.fontSize = size + "px";
  }
}

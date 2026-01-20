// Get elements
const addBtn = document.getElementById("addWishBtn");
const input = document.getElementById("wishInput");
const wishList = document.getElementById("wish-list");
const errorMsg = document.getElementById("errorMsg");

// List of banned words (customize this)
const badWords = ["badword1", "badword2", "stupid", "hate"];

// Function to check bad words
function containsBadWord(text) {
  const lowerText = text.toLowerCase();
  return badWords.some(word => lowerText.includes(word));
}

// Handle click
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

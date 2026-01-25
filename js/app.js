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
  await loadWishes();

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

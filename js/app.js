// Get elements
const addBtn = document.getElementById("addWishBtn");
const input = document.getElementById("wishInput");
const wishList = document.getElementById("wish-list");
const errorMsg = document.getElementById("errorMsg");


// Function to check bad words
async function containsBadWord(text) {
  const res = await fetch("/api/qc", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  });

  if (!res.ok) {
    throw new Error("Moderation failed");
  }

  const data = await res.json();
  return data.toxic;
}

  const result = await response.json();
  const toxicScore =
    result?.[0]?.find(r => r.label === "toxic")?.score || 0;

  return toxicScore > 0.7; // threshold (tweakable)
}

// Handle click
addBtn.addEventListener("click", async () => {
  const text = input.value.trim();

  if (!text) {
    errorMsg.textContent = "Please write something first.";
    return;
  }

  try {
    const toxic = await containsBadWord(text);

    if (toxic) {
      errorMsg.textContent =
        "Your wish contains inappropriate or harmful language.";
      return;
    }
  } catch (err) {
    console.error(err);
    errorMsg.textContent =
      "Content moderation service unavailable.";
    return;
  }

  errorMsg.textContent = "";

  try {
    await saveWishToDB(text);
    await loadWishes();
    input.value = "";
  } catch (e) {
    console.error(e);
    errorMsg.textContent = "Failed to save wish.";
  }
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




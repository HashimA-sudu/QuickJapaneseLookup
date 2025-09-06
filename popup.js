document.addEventListener("DOMContentLoaded", () => {
  const aiInput = document.getElementById("aiInput");
  const saveAiBtn = document.getElementById("saveAiBtn");
  const deckInput = document.getElementById("deckInput");
  const saveDeckBtn = document.getElementById("saveDeckBtn");
  const settingsPanel = document.getElementById("settingsPanel");
  const settingsToggle = document.getElementById("settingsToggle");

  // Toggle settings panel
  settingsToggle.addEventListener("click", () => {
    settingsPanel.style.display = settingsPanel.style.display === "block" ? "none" : "block";
  });

  // Load saved values
  chrome.storage.sync.get(["aiLink", "ankiDeck"], (data) => {
    if (data.aiLink) aiInput.value = data.aiLink;
    if (data.ankiDeck) deckInput.value = data.ankiDeck;
  });

  // Save AI link
  saveAiBtn.addEventListener("click", () => {
    const value = aiInput.value.trim();
    if (value) {
      const fullUrl = value.startsWith("http") ? value : "https://" + value;
      chrome.storage.sync.set({ aiLink: fullUrl }, () => {
        console.log("AI link saved:", fullUrl);
      });
    }
  });

  // Save Anki deck
  saveDeckBtn.addEventListener("click", () => {
    const value = deckInput.value.trim() || "Default";
    chrome.storage.sync.set({ ankiDeck: value }, () => {
      console.log("Anki deck saved:", value);
    });
  });
});

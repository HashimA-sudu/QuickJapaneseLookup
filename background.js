// background.js (MV3)

// Defaults
let aiLink = "https://chatgpt.com/?q=";
let ankiDeck = "Default"; // default deck

// Load saved settings
chrome.storage.sync.get(["aiLink", "ankiDeck"], (data) => {
  if (data.aiLink) aiLink = data.aiLink;
  if (data.ankiDeck) ankiDeck = data.ankiDeck;
});

// Update if changed
chrome.storage.onChanged.addListener((changes) => {
  if (changes.aiLink?.newValue) aiLink = changes.aiLink.newValue;
  if (changes.ankiDeck?.newValue) ankiDeck = changes.ankiDeck.newValue;
});

// --- Create context menus ---
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "searchJisho",
    title: "Search in Jisho: \"%s\"",
    contexts: ["selection"]
  });

chrome.contextMenus.create({
    id: "addToAnki",
    title: "Add to Anki: \"%s\"",
    contexts: ["selection"]
  });

  chrome.contextMenus.create({
    id: "gptOrigins",
    title: "Ask AI: Origins of \"%s\"",
    contexts: ["selection"]
  });

  chrome.contextMenus.create({
    id: "gptExplain",
    title: "Ask AI: Explanation of \"%s\"",
    contexts: ["selection"]
  });

  chrome.contextMenus.create({
    id: "gptExamples",
    title: "Ask AI: Examples for \"%s\"",
    contexts: ["selection"]
  });


});

// --- Handle context menu clicks ---
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!info.selectionText) return;

  if (info.menuItemId === "searchJisho") {
    const url = "https://jisho.org/search/" + encodeURIComponent(info.selectionText);
    chrome.tabs.create({ url });
    return;
  }

  if (info.menuItemId === "addToAnki") {
    addToAnki(info.selectionText);
    return;
  }

  let prompt = "";
  if (info.menuItemId === "gptOrigins") {
    prompt = `Explain the origins/etymology of the Japanese word or phrase: "${info.selectionText}". Include kanji breakdown, literal meaning, and history.`;
  }
  if (info.menuItemId === "gptExplain") {
    prompt = `Give an in-depth explanation of the Japanese word or phrase: "${info.selectionText}". Include grammar, nuance, politeness, and common usage.`;
  }
  if (info.menuItemId === "gptExamples") {
    prompt = `Provide 5 natural example sentences using the Japanese word or phrase: "${info.selectionText}". Include furigana and English translations.`;
  }

  if (prompt) {
    const url = aiLink + encodeURIComponent(prompt);
    chrome.tabs.create({ url });
  }
});
function notifyUser(message) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icons/icon128.png",
    title: "Smart Japanese Lookup",
    message: message
  });
}

// --- Add to Anki function using AnkiConnect (GUI mode) ---
function addToAnki(text) {
  fetch("http://127.0.0.1:8765", {
    method: "POST",
    body: JSON.stringify({
      action: "guiAddCards",
      version: 6,
      params: {
        note: {
          deckName: ankiDeck,
          modelName: "Japanese Sentences",
          fields: {
            SentKanji: text,
          },
        }
      }
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        alert("Failed to open Anki Add Note dialog: " + data.error);
      } else {
        alert("Opened Anki Add Cards window with prefilled note.");
      }
    })
    .catch(err => {
      alert("Could not connect to Anki. Is Anki open and AnkiConnect installed?");
    });
}

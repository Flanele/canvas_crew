const fs = require("fs");
const path = require("path");

function addMessageToHistory(roomId, message) {
  if (!roomId) return;

  const chatDir = path.join(__dirname, "..", "temp", "chats");
  const filePath = path.join(chatDir, `${roomId}.json`);
  fs.mkdirSync(chatDir, { recursive: true });

  let history = [];
  if (fs.existsSync(filePath)) {
    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      history = JSON.parse(raw);
    } catch (err) {
      console.error("❌ Error reading chat file:", err);
    }
  }

  history.push(message);

  try {
    fs.writeFileSync(filePath, JSON.stringify(history, null, 2), "utf-8");
    console.log(`💾 Saved message to ${filePath}`);
  } catch (err) {
    console.error("❌ Error saving chat:", err);
  }
}

module.exports = { addMessageToHistory };

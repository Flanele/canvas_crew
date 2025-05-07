const fs = require("fs");
const path = require("path");

function clearChatHistory() {
    const chatsDir = path.join(__dirname, "..", "temp", "chats");
  
    if (fs.existsSync(chatsDir)) {
      fs.readdirSync(chatsDir).forEach((file) => {
        const filePath = path.join(chatsDir, file);
        if (fs.lstatSync(filePath).isFile()) {
          fs.unlinkSync(filePath);
        }
      });
      console.log("🧹 Cleared chat history files on server start");
    }
  }
  
module.exports = clearChatHistory;

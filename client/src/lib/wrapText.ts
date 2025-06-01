export const wrapText = (
  text: string,
  maxWidth: number,
  fontSize: number
): string[] => {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) return [text];

  context.font = `${fontSize}px Calibri`;
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";

  for (let word of words) {
    const testLine = line ? `${line} ${word}` : word;
    const testWidth = context.measureText(testLine).width;

    if (testWidth <= maxWidth) {
      line = testLine;
    } else {
      // если само слово длиннее maxWidth, разбиваем его
      const wordWidth = context.measureText(word).width;
      if (wordWidth > maxWidth) {
        if (line) {
          lines.push(line);
          line = "";
        }

        let subWord = "";
        for (const char of word) {
          const testSub = subWord + char;
          if (context.measureText(testSub).width > maxWidth) {
            lines.push(subWord);
            subWord = char;
          } else {
            subWord = testSub;
          }
        }

        if (subWord) {
          line = subWord;
        }
      } else {
        if (line) lines.push(line);
        line = word;
      }
    }
  }

  if (line) lines.push(line);

  return lines;
};

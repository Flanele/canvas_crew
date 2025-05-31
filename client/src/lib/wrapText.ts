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
    const testLine = line ? line + " " + word : word;
    const width = context.measureText(testLine).width;

    if (width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = testLine;
    }
  }

  if (line) lines.push(line);

  return lines;
};

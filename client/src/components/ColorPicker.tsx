import { HexColorPicker } from "react-colorful";
import { useCanvasStore } from "../store/canvas";

export const ColorPicker = () => {
  const color = useCanvasStore((state) => state.color);
  const setColor = useCanvasStore((state) => state.setColor);

  return <HexColorPicker color={color} onChange={setColor} />;
};
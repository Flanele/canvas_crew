import { SliderPicker } from "react-color";
import { useCanvasStore } from "../store/canvas";

export const StrokeColorPicker = () => {
  const strokeColor = useCanvasStore((state) => state.strokeColor);
  const setStrokeColor = useCanvasStore((state) => state.setStrokeColor);

  return (
    <SliderPicker
      color={strokeColor}
      onChangeComplete={(col) => setStrokeColor(col.hex)}
    />
  );
};

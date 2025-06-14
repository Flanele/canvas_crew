import { SliderPicker } from "react-color";
import { useSetStrokeColor, useStrokeColor } from "../store/selectors/canvasSelectors";

export const StrokeColorPicker = () => {
  const strokeColor = useStrokeColor();
  const setStrokeColor = useSetStrokeColor();

  return (
    <SliderPicker
      color={strokeColor}
      onChangeComplete={(col) => setStrokeColor(col.hex)}
    />
  );
};

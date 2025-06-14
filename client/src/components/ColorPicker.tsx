import { HexColorPicker } from "react-colorful";
import { useColor, useSetColor } from "../store/selectors/canvasSelectors";

export const ColorPicker = () => {
  const color = useColor();
  const setColor = useSetColor();

  return (
    <HexColorPicker
      color={color}
      onChange={setColor}
      style={{ cursor: "pointer" }}
    />
  );
};

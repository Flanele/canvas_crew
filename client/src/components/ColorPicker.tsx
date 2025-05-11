import React from "react";
import { HexColorPicker } from "react-colorful";

export const ColorPicker = () => {
  const [color, setColor] = React.useState("#aabbcc");
  return <HexColorPicker color={color} onChange={setColor} />;
};
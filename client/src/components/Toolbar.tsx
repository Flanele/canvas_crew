import { ColorPicker } from "./ColorPicker";
import {
  Pencil,
  Brush,
  PenTool,
  Eraser,
  Square,
  Circle,
  Text,
  MousePointer2,
  Undo2,
  Redo2,
} from "lucide-react";
import { ToolIcon } from "./ToolIcon";
import { StrokeSettingsPanel } from "./StrokeSettingsPanel";
import { useCanvasStore } from "../store/canvas";

export const ToolBar = () => {
  const setTool = useCanvasStore((state) => state.setTool);

  return (
    <div className="bg-[#D7DBD4] flex flex-col gap-10 h-full p-4">
      {/* Top: Color Picker */}
      <div className="flex justify-center py-4">
        <ColorPicker />
      </div>

      {/* Tools */}
      <div className="flex flex-col items-center gap-4">
        {/* Row 1: Brushes */}
        <div className="flex gap-6">
          <ToolIcon icon={<Pencil size={20} />} label="Pencil" onClick={() => setTool("Pencil")} />
          <ToolIcon icon={<Brush size={20} />} label="Brush" onClick={() => setTool("Brush")} />
          <ToolIcon icon={<PenTool size={20} />} label="Marker" onClick={() => setTool("Marker")} />
        </div>

        {/* Row 2: Main actions */}
        <div className="flex gap-6">
          <ToolIcon icon={<MousePointer2 size={20} />} label="Select" onClick={() => setTool("Select")} />
          <ToolIcon icon={<Eraser size={20} />} label="Eraser" onClick={() => setTool("Eraser")} />
          <ToolIcon icon={<Text size={20} />} label="Text" onClick={() => setTool("Text")} />
        </div>

        {/* Row 3: Shapes */}
        <div className="flex gap-6">
          <ToolIcon icon={<Square size={20} />} label="Rect" onClick={() => setTool("Rect")} />
          <ToolIcon icon={<Circle size={20} />} label="Circle" onClick={() => setTool("Circle")} />
        </div>

        {/* Divider */}
        <div className="h-px w-16 bg-gray-400" />

        {/* Row 4: Undo/Redo */}
        <div className="flex gap-6">
          <ToolIcon icon={<Undo2 size={20} />} label="Undo" onClick={() => console.log("TODO: Undo")} />
          <ToolIcon icon={<Redo2 size={20} />} label="Redo" onClick={() => console.log("TODO: Redo")} />
        </div>
      </div>

      {/* Stroke settings */}
      <StrokeSettingsPanel />
    </div>
  );
};

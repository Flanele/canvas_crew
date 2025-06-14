export type Point = [number, number];
export type RoomId = string;

export type Tool =
  | "Pencil"
  | "Brush"
  | "Eraser"
  | "Marker"
  | "Rect"
  | "Circle"
  | "Text"
  | "Select";

interface BaseShape {
  id: string;
  tool: Tool;
  color: string;
  strokeWidth: number;
  opacity: number;
}

export interface Mask {
  id: string;
  lines: MaskLine[];
}

interface MaskedShape {
  mask?: Mask;
}

export interface MaskLine {
  points: Point[];
  strokeWidth: number;
}

interface LineShape extends BaseShape, MaskedShape {
  type: "line";
  points: Point[];
}

interface RectShape extends BaseShape, MaskedShape {
  type: "rect";
  start: Point;
  end: Point;
  strokeColor: string;
}

interface CircleShape extends BaseShape, MaskedShape {
  type: "circle";
  center: Point;
  radius: number;
  strokeColor: string;
}

interface TextShape extends BaseShape, MaskedShape {
  type: "text";
  point: Point;
  text: string;
  strokeColor: string;
}

export type CanvasElement = LineShape | RectShape | CircleShape | TextShape;
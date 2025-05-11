import Konva from "konva";
import React from "react";

interface ZoomState {
  scale: number;
  offset: { x: number; y: number };
  handleWheel: (e: Konva.KonvaEventObject<WheelEvent>) => void;
}

export const useZoom = (stageRef: React.RefObject<Konva.Stage | null>): ZoomState => {
  const [scale, setScale] = React.useState<number>(1);
  const [offset, setOffset] = React.useState({ x: 0, y: 0 });

  const MIN_SCALE = 0.4;
  const MAX_SCALE = 4;

  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = scale;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const scaleBy = 1.05;
    const direction = e.evt.deltaY > 0 ? -1 : 1;
    let newScale = oldScale * (direction > 0 ? scaleBy : 1 / scaleBy);
    newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale));

    // координаты курсора относительно Stage
    const mousePointTo = {
      x: (pointer.x - offset.x) / oldScale,
      y: (pointer.y - offset.y) / oldScale,
    };

    const newOffset = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };

    setScale(newScale);
    setOffset(newOffset);
  };

  return {
    scale,
    offset,
    handleWheel,
  };
};

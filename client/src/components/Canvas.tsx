import React from "react";
import { Stage, Layer, Line } from "react-konva";
import Konva from "konva";
import { useZoom } from "../hooks/useZoom";

export const Canvas = () => {
  const [lines, setLines] = React.useState<number[][]>([]);
  const isDrawing = React.useRef(false);
  const stageRef = React.useRef<Konva.Stage>(null);
  const containerRef = React.useRef<HTMLDivElement>(null); // scrollable container

  const { scale, handleWheel } = useZoom(stageRef);

  const BASE_WIDTH = 750;
  const BASE_HEIGHT = 450;
  const WORKSPACE_WIDTH = 2200;
  const WORKSPACE_HEIGHT = 1400;

  const handleMouseDown = () => {
    const stage = stageRef.current;
    if (!stage) return;
    const pos = stage.getPointerPosition();
    if (!pos) return;

    const x = pos.x / scale;
    const y = pos.y / scale;

    isDrawing.current = true;
    setLines((prev) => [...prev, [x, y]]);
  };

  const handleMouseMove = () => {
    if (!isDrawing.current) return;
    const stage = stageRef.current;
    if (!stage) return;
    const pos = stage.getPointerPosition();
    if (!pos) return;

    const x = pos.x / scale;
    const y = pos.y / scale;

    setLines((prev) => {
      const lastLine = prev[prev.length - 1];
      const updated = [...lastLine, x, y];
      return [...prev.slice(0, -1), updated];
    });
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  React.useEffect(() => {
    const handleMouseUp = () => {
      isDrawing.current = false;
    };
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, []);

  // Scroll to center on mount
  React.useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.scrollLeft = (WORKSPACE_WIDTH - container.clientWidth) / 2;
      container.scrollTop = (WORKSPACE_HEIGHT - container.clientHeight) / 2;
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-[calc(100vh-62px)] bg-bg overflow-auto"
    >
      <div
        className="relative"
        style={{
          width: WORKSPACE_WIDTH,
          height: WORKSPACE_HEIGHT,
        }}
      >
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white"
          style={{
            width: BASE_WIDTH * scale,
            height: BASE_HEIGHT * scale,
          }}
        >
          <Stage
            ref={stageRef}
            width={BASE_WIDTH * scale}
            height={BASE_HEIGHT * scale}
            scale={{ x: scale, y: scale }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onWheel={handleWheel}
          >
            <Layer>
              {lines.map((points, i) => (
                <Line
                  key={i}
                  points={points}
                  stroke="black"
                  strokeWidth={2}
                  tension={0.5}
                  lineCap="round"
                />
              ))}
            </Layer>
          </Stage>
        </div>
      </div>
    </div>
  );
};

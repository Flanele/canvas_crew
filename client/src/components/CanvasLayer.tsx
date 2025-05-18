import { Layer, Line } from "react-konva";
import { useCanvasStore } from "../store/canvas";
import React from "react";
import { LineConfig } from "konva/lib/shapes/Line";

interface Props {
    roomId: string;
}

export const CanvasLayer: React.FC<Props> = ({ roomId }) => {
  const lines =
    useCanvasStore(
      React.useCallback((state) => state.canvases[roomId], [roomId])
    ) || [];

    return (
        <Layer>
          {lines.map((line, i) => {
            let style: Partial<LineConfig> = {
              strokeWidth: line.strokeWidth,
              opacity: line.opacity,
              tension: 0,
              shadowBlur: 0,
            };
    
            switch (line.tool) {
              case "Brush":
                style = {
                  ...style,
                  tension: 0.6,
                  shadowBlur: 3,
                  shadowColor: line.color,
                };
                break;
    
              case "Marker":
                style = {
                  ...style,
                  opacity: line.opacity * 0.8,
                  shadowColor: line.color,
                  shadowBlur: 6,
                  shadowOffset: { x: 1, y: 1 },
                  globalCompositeOperation: "multiply",
                };
                break;
    
              case "Pencil":
                style = {
                  ...style,
                };
                break;
    
              case "Eraser":
                style = {
                  ...style,
                  stroke: "#ffffff",
                  globalCompositeOperation: "destination-out",
                };
                break;
            }
    
            return (
              <Line
                key={i}
                points={line.points.flat()}
                stroke={line.tool === "Eraser" ? "#ffffff" : line.color}
                {...style}
                lineCap="round"
                lineJoin="round"
                globalCompositeOperation={
                  line.tool === "Eraser" ? "destination-out" : style.globalCompositeOperation || "source-over"
                }
              />
            );
          })}
        </Layer>
      );
    };
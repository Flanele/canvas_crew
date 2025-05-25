import { Circle, Layer, Line, Rect, Text } from "react-konva";
import { useCanvasStore } from "../store/canvas";
import React from "react";
import { LineConfig } from "konva/lib/shapes/Line";

interface Props {
    roomId: string;
}

export const CanvasLayer: React.FC<Props> = ({ roomId }) => {
  const elements =
    useCanvasStore(
      React.useCallback((state) => state.canvases[roomId], [roomId])
    ) || [];

    return (
      <Layer>
        {elements.map((el) => {
          const isLine = el.type === "line";
  
          const commonStyle: Partial<LineConfig> = {
            strokeWidth: el.strokeWidth,
            opacity: el.opacity,
            ...(isLine && {
              lineCap: "round",
              lineJoin: "round",
            }),
          };
  
          switch (el.type) {
            case "line": {
              let style = {
                tension: 0,
                shadowBlur: 0,
                ...commonStyle,
                stroke: el.tool === "Eraser" ? "#ffffff" : el.color,
              };
  
              if (el.tool === "Brush") {
                style = {
                  ...style,
                  tension: 0.6,
                  shadowBlur: 3,
                  shadowColor: el.color,
                };
              } else if (el.tool === "Marker") {
                style = {
                  ...style,
                  opacity: el.opacity * 0.8,
                  shadowColor: el.color,
                  shadowBlur: 6,
                  shadowOffset: { x: 1, y: 1 },
                  globalCompositeOperation: "multiply",
                };
              } else if (el.tool === "Eraser") {
                style = {
                  ...style,
                  globalCompositeOperation: "destination-out",
                };
              }
  
              return (
                <Line
                  key={el.id}
                  points={el.points.flat()}
                  {...style}
                  globalCompositeOperation={
                    el.tool === "Eraser"
                      ? "destination-out"
                      : style.globalCompositeOperation || "source-over"
                  }
                />
              );
            }
  
            case "rect": {
              const x = Math.min(el.start[0], el.end[0]);
              const y = Math.min(el.start[1], el.end[1]);
              const width = Math.abs(el.end[0] - el.start[0]);
              const height = Math.abs(el.end[1] - el.start[1]);
  
              return (
                <Rect
                  key={el.id}
                  x={x}
                  y={y}
                  width={width}
                  height={height}
                  fill={el.color}
                  stroke={el.strokeColor}
                  {...commonStyle}
                />
              );
            }
  
            case "circle": {
              return (
                <Circle
                  key={el.id}
                  x={el.center[0]}
                  y={el.center[1]}
                  radius={el.radius}
                  fill={el.color}
                  stroke={el.strokeColor}
                  {...commonStyle}
                />
              );
            }

            case "text": {
              return (
                <Text
                  key={el.id}
                  x={el.point[0]}
                  y={el.point[1]}
                  text={el.text}
                  fontSize={el.strokeWidth * 4} // масштабируем размер от strokeWidth
                  fill={el.color}
                  opacity={el.opacity}
                  stroke={el.strokeColor}
                />
              );
            }
  
            default:
              return null;
          }
        })}
      </Layer>
    );
};


import { Circle, Group, Layer, Rect, Text } from "react-konva";
import { useCanvasStore } from "../store/canvas";
import React from "react";
import { LineConfig } from "konva/lib/shapes/Line";
import { wrapText } from "../lib/wrapText";
import socket from "../socket/socket";
import { makeDraggableProps } from "../lib/makeDraggbleProps";
import { DraggableLine } from "./DraggbleLine";

interface Props {
  roomId: string;
  BASE_WIDTH: number;
}

export const CanvasLayer: React.FC<Props> = ({ roomId, BASE_WIDTH }) => {
  const elements =
    useCanvasStore(
      React.useCallback((state) => state.canvases[roomId], [roomId])
    ) || [];
  const tool = useCanvasStore((state) => state.tool);
  const updatePosition = useCanvasStore((state) => state.updateElementPosition);

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
              <DraggableLine
                key={el.id}
                el={el}
                tool={tool}
                updatePosition={updatePosition}
                roomId={roomId}
                socket={socket}
                style={style}
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
                {...makeDraggableProps({
                  tool,
                  element: el,
                  updatePosition,
                  roomId,
                  socket,
                })}
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
                {...makeDraggableProps({
                  tool,
                  element: el,
                  updatePosition,
                  roomId,
                  socket,
                })}
              />
            );
          }

          case "text": {
            const fontSize = el.strokeWidth * 4;
            const padding = 10;
            const maxWidth = BASE_WIDTH - el.point[0] - padding;
            const lineHeight = fontSize * 1.2;
            const lines = wrapText(el.text, maxWidth, fontSize);

            return (
              <Group key={el.id}>
                {lines.map((line, idx) => (
                  <Text
                    key={line + idx}
                    x={el.point[0]}
                    y={el.point[1] + idx * lineHeight}
                    text={line}
                    fontSize={fontSize}
                    fill={el.color}
                    opacity={el.opacity}
                    stroke={el.strokeColor}
                    strokeWidth={1}
                    fontFamily="Calibri"
                    {...makeDraggableProps({
                      tool,
                      element: el,
                      updatePosition,
                      roomId,
                      socket,
                    })}
                  />
                ))}
              </Group>
            );
          }

          default:
            return null;
        }
      })}
    </Layer>
  );
};

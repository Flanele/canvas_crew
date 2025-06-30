import { Circle, Group, Layer, Rect, Text } from "react-konva";
import React from "react";
import { LineConfig } from "konva/lib/shapes/Line";
import { wrapText } from "../lib/wrapText";
import socket from "../socket/socket";
import { DraggableLine } from "./DraggbleLine";
import { MaskedDraggableGroup } from "./MaskedDraggableGroup";
import {  useCanvasElements, useTool, useUpdateElementPosition } from "../store/selectors/canvasSelectors";
import { BASE_WIDTH } from "./Canvas";

interface Props {
  roomId: string;
}


export const CanvasLayer: React.FC<Props> = ({ roomId }) => {
  const elements = useCanvasElements(roomId);
  const tool = useTool();
  const updatePosition = useUpdateElementPosition();

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
                opacity: 1
              };
            }

            return (
              <DraggableLine
                key={el.id}
                el={el}
                draggable={tool === "Select" && el.tool !== "Eraser"}
                updatePosition={updatePosition}
                roomId={roomId}
                socket={socket}
                style={style}
                
              />
            );
          }

          case "rect": {
            const width = Math.abs(el.end[0] - el.start[0]);
            const height = Math.abs(el.end[1] - el.start[1]);
            return (
              <MaskedDraggableGroup
                key={el.id}
                el={el}
                id={el.id}
                mask={el.mask}
                position={el.start}
                draggable={tool === "Select" && el.tool !== "Eraser"}
                updatePosition={updatePosition}
                roomId={roomId}
                socket={socket}
              >
                <Rect
                  x={0}
                  y={0}
                  id={el.id}
                  width={width}
                  height={height}
                  fill={el.color}
                  stroke={el.strokeColor}
                  {...commonStyle}
                />
              </MaskedDraggableGroup>
            );
          }

          case "circle": {
            return (
              <MaskedDraggableGroup
                key={el.id}
                id={el.id}
                el={el}
                mask={el.mask}
                position={el.center} // передаем центр круга
                draggable={tool === "Select" && el.tool !== "Eraser"}
                updatePosition={updatePosition}
                roomId={roomId}
                socket={socket}
              >
                <Circle
                  x={0}
                  y={0}
                  id={el.id}
                  radius={el.radius}
                  fill={el.color}
                  stroke={el.strokeColor}
                  {...commonStyle}
                />
              </MaskedDraggableGroup>
            );
          }

          case "text": {
            const fontSize = el.strokeWidth * 4;
            const padding = 10;
            const maxWidth = BASE_WIDTH - el.point[0] - padding;
            const lineHeight = fontSize * 1.2;
            const lines = wrapText(el.text, maxWidth, fontSize);

            return (
              <MaskedDraggableGroup
                key={el.id}
                id={el.id}
                el={el}
                mask={el.mask}
                position={el.point}
                draggable={tool === "Select" && el.tool !== "Eraser"}
                updatePosition={updatePosition}
                roomId={roomId}
                socket={socket}
              >
                <Group>
                  {lines.map((line, idx) => (
                    <Text
                      key={line + idx}
                      id={el.id}
                      x={0} // для каждой строки устанавливаем x = 0 относительно группы
                      y={idx * lineHeight} // высота каждой строки
                      text={line}
                      fontSize={fontSize}
                      fill={el.color}
                      opacity={el.opacity}
                      stroke={el.strokeColor}
                      strokeWidth={0}
                      fontFamily="Calibri"
                    />
                  ))}
                </Group>
              </MaskedDraggableGroup>
            );
          }

          default:
            return null;
        }
      })}
    </Layer>
  );
};

import React from "react";

type Props = {
  textareaRef: React.RefObject<HTMLDivElement | null>;
  x: number;
  y: number;
  scale: number;
  strokeWidth: number;
  color: string;
  strokeColor?: string;
  onInput: (e: React.FormEvent<HTMLDivElement>) => void;
  onBlur: () => void;
};

export const TextInputOverlay: React.FC<Props> = ({
  textareaRef,
  x,
  y,
  scale,
  strokeWidth,
  color,
  onInput,
  onBlur,
}) => {
  const fontSize = strokeWidth * 4 * scale;
  const lineHeight = fontSize * 1.2;

  return (
    <div
      ref={textareaRef}
      contentEditable
      suppressContentEditableWarning
      onInput={onInput}
      onBlur={onBlur}
      className={`
        absolute z-20
        whitespace-pre-wrap break-words
        bg-transparent outline-none border-none
        p-0 m-0
      `}
      style={{
        top: `${y * scale}px`,
        left: `${x * scale}px`,
        fontSize: `${fontSize}px`,
        lineHeight: `${lineHeight}px`,
        color: 'transparent',
        caretColor: color,
      }}
    />
  );
};

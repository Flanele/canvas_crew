import React from "react";

type Props = {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  x: number;
  y: number;
  scale: number;
  strokeWidth: number;
  color: string;
  strokeColor?: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur: () => void;
};

export const TextInputOverlay: React.FC<Props> = ({
  textareaRef,
  x,
  y,
  scale,
  strokeWidth,
  color,
  strokeColor,
  onChange,
  onBlur,
}) => {
  return (
    <textarea
      ref={textareaRef}
      className={`
        absolute z-20
        resize-none overflow-hidden
        bg-transparent border-none outline-none
        p-0 m-0 leading-none
      `}
      style={{
        top: `${y * scale}px`,
        left: `${x * scale}px`,
        fontSize: `${strokeWidth * 4 * scale}px`,
        color,
        WebkitTextStroke: strokeColor ? `1px ${strokeColor}` : undefined,
      }}
      onChange={onChange}
      onBlur={onBlur}
    />
  );
};

import {
  useOpacity,
  useSetOpacity,
  useSetStrokeWidth,
  useStrokeWidth,
} from "../store/selectors/canvasSelectors";

export const StrokeSettingsPanel = () => {
  const strokeWidth = useStrokeWidth();
  const setStrokeWidth = useSetStrokeWidth();
  const opacity = useOpacity();
  const setOpacity = useSetOpacity();

  const strokeWidthOptions = [
    1, 2, 3, 4, 5, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 30, 40,
  ];

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const index = Number(e.target.value);
    const selectedWidth = strokeWidthOptions[index];
    setStrokeWidth(selectedWidth);
  };

  const currentIndex = strokeWidthOptions.findIndex((w) => w === strokeWidth);

  return (
    <div className="flex flex-col gap-4 text-sm text-gray-700 px-2 mt-auto">
      <div className="flex flex-col">
        <label htmlFor="thickness" className="mb-1">
          Stroke Width
        </label>
        <input
          id="thickness"
          type="range"
          min={0}
          max={strokeWidthOptions.length - 1}
          step={1}
          value={currentIndex}
          onChange={handleSliderChange}
          className="w-full accent-green-800 cursor-pointer"
        />
      </div>
      <div className="flex flex-col">
        <label htmlFor="opacity" className="mb-1">
          Opacity
        </label>
        <input
          id="opacity"
          type="range"
          min={0.1}
          max={1}
          step={0.1}
          defaultValue={opacity}
          className="w-full accent-green-800 cursor-pointer"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setOpacity(Number(e.target.value))
          }
        />
      </div>
    </div>
  );
};

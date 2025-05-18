import { useCanvasStore } from "../store/canvas";

interface ToolIconProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

export const ToolIcon = ({ icon, label, onClick }: ToolIconProps) => {
  const tool = useCanvasStore((state) => state.tool);
  const active = tool == label;


  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center text-gray-700 hover:text-black transition rounded-md p-1 cursor-pointer ${
        active ? "border-1 border-green-800" : "border border-transparent"
      }`}
      title={label}
    >
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </button>
  );
};
  
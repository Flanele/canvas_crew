export const ToolIcon = ({ icon, label }: { icon: React.ReactNode; label: string }) => {
    return (
      <button
        className="flex flex-col items-center text-gray-700 hover:text-black transition cursor-pointer"
        title={label}
      >
        {icon}
        <span className="text-xs mt-1">{label}</span>
      </button>
    );
  };
  
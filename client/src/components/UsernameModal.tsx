import React from "react";
import { useUserStore } from "../store/user";
import { X } from "lucide-react";

interface Props {
  onHide: () => void;
}

export const UsernameModal: React.FC<Props> = ({ onHide }) => {
  const { username, setUsername } = useUserStore();
  const [inputValue, setInputValue] = React.useState<string>(username);
  const [accessError, setAccessError] = React.useState<boolean>(false);

  const handleSubmit = () => {
    if (inputValue) {
      setUsername(inputValue);
      onHide();
    }

    setAccessError(true);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (accessError) {
      setAccessError(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="relative bg-white p-6 rounded-2xl shadow-lg w-[90%] max-w-md">
        <button
          onClick={onHide}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 transition cursor-pointer"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl text-dark-text font-semibold mb-4">
          Enter your name:
        </h2>

        <input
          type="text"
          value={inputValue}
          onChange={handleInput}
          className="w-full bg-bg p-[10px] text-[18px] placeholder-gray rounded-xl mb-3 focus:outline-none focus:ring focus:ring-darker-bg"
          placeholder="For example, Alex"
        />

        {accessError && (
          <p className="text-dark-text text-sm mb-4">
            Please enter a name first!
          </p>
        )}

        <button
          onClick={handleSubmit}
          className="mt-4 btn-dark text-light-text text-[18px] w-[100%] py-3 rounded-[30px] hover:bg-green-700 transition cursor-pointer"
        >
          Save
        </button>
      </div>
    </div>
  );
};

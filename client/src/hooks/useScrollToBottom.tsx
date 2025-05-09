import { useEffect } from "react";

export const useScrollToBottom = (
  ref: React.RefObject<HTMLElement | null>,
  deps: any[] = []
) => {
  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, deps);
};
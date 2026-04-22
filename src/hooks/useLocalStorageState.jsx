import { useEffect, useState } from "react";

export default function useLocalStorageState(key, defaultValue, options = {}) {
  const { serialize = JSON.stringify, deserialize = JSON.parse } = options;

  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key);

      if (saved === null) {
        return typeof defaultValue === "function"
          ? defaultValue()
          : defaultValue;
      }

      return deserialize(saved);
    } catch (error) {
      console.error(`Failed to load "${key}" from localStorage:`, error);
      return typeof defaultValue === "function" ? defaultValue() : defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, serialize(value));
    } catch (error) {
      console.error(`Failed to save "${key}" to localStorage:`, error);
    }
  }, [key, value, serialize]);

  return [value, setValue];
}

import {
  useState,
  useEffect,
  useCallback,
  Dispatch,
  SetStateAction,
} from "react";

type SetValue<T> = Dispatch<SetStateAction<T>>;

interface UseLocalStorageOptions {
  syncAcrossTabs?: boolean;
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions = {}
): [T, SetValue<T>, () => void] {
  const { syncAcrossTabs = true } = options;

  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue: SetValue<T> = useCallback(
    (value) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;

        setStoredValue(valueToStore);

        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));

          if (syncAcrossTabs) {
            window.dispatchEvent(
              new CustomEvent("local-storage-change", {
                detail: { key, value: valueToStore },
              })
            );
          }
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue, syncAcrossTabs]
  );

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(key);

        if (syncAcrossTabs) {
          window.dispatchEvent(
            new CustomEvent("local-storage-change", {
              detail: { key, value: null },
            })
          );
        }
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue, syncAcrossTabs]);

  useEffect(() => {
    if (!syncAcrossTabs || typeof window === "undefined") {
      return;
    }

    const handleStorageChange = (e: StorageEvent | CustomEvent) => {
      if (e instanceof StorageEvent) {
        if (e.key === key && e.newValue) {
          try {
            setStoredValue(JSON.parse(e.newValue) as T);
          } catch (error) {
            console.error(
              `Error parsing localStorage value for key "${key}":`,
              error
            );
          }
        }
        return;
      }

      const customEvent = e as CustomEvent<{ key: string; value: T | null }>;
      if (customEvent.detail.key === key) {
        if (customEvent.detail.value === null) {
          setStoredValue(initialValue);
        } else {
          setStoredValue(customEvent.detail.value);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange as EventListener);
    window.addEventListener(
      "local-storage-change",
      handleStorageChange as EventListener
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorageChange as EventListener
      );
      window.removeEventListener(
        "local-storage-change",
        handleStorageChange as EventListener
      );
    };
  }, [key, initialValue, syncAcrossTabs]);

  return [storedValue, setValue, removeValue];
}

/**
 * Hook to check if localStorage is available
 */
export function useIsLocalStorageAvailable(): boolean {
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    try {
      const testKey = "__localStorage_test__";
      window.localStorage.setItem(testKey, "test");
      window.localStorage.removeItem(testKey);
      setIsAvailable(true);
    } catch {
      setIsAvailable(false);
    }
  }, []);

  return isAvailable;
}

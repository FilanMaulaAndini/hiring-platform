"use client";

import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({
    message: "",
    type: "success",
    visible: false,
  });

  const showToast = useCallback(
    (message, type = "success", duration = 3000) => {
      setToast({ message, type, visible: true });
      setTimeout(
        () => setToast((prev) => ({ ...prev, visible: false })),
        duration
      );
    },
    []
  );

  return (
    <ToastContext.Provider value={{ toast, showToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

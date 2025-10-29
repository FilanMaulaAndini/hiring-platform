"use client";

import React from "react";
import { useToast } from "../../context/ToastContext";
import styles from "./Toast.module.css";

export default function Toast() {
  const { toast, showToast } = useToast();

  if (!toast.visible) return null;

  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return "✓";
      case "error":
        return "✕";
      case "info":
        return "ℹ️";
      default:
        return "";
    }
  };

  return (
    <div className={styles.toast}>
      <div className={styles.toastIcon}>{getIcon()}</div>
      <span className={styles.toastMessage}>{toast.message}</span>
      <button
        className={styles.toastClose}
        onClick={() => showToast("", toast.type)}
      >
        ✕
      </button>
    </div>
  );
}

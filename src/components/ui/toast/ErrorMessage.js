"use-client";

import styles from "./ErrorMessage.module.css";
import { BiError } from "react-icons/bi";

export default function ErrorMessage({ message }) {
  if (!message) return null;
  return (
    <div className={styles.helper}>
      <span className={styles.errorIcon}>
        <BiError />
      </span>
      <span className={styles.helperText}>{message}</span>
    </div>
  );
}

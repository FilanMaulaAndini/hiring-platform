"use client";
import styles from "./SuccessApply.module.css";

export default function SuccessApply() {
  return (
    <div className={styles.signIn}>
      <div className={styles.modal}>
        <div className={styles.frame}>
          <div className={styles.verifyCaption}>
            <div className={styles.container}>
              <img
                src="/icons/success.svg"
                alt="Success Apply"
                className={styles.successApply}
              />
            </div>
            <h2 className={styles.title}>🎉 Your application was sent!</h2>
            <p className={styles.desc}>
              Congratulations! You've taken the first step towards a rewarding
              career at Rakamin. We look forward to learning more about you
              during the application process.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";
import styles from "./EmailSent.module.css";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

export default function EmailSent() {
  const emailId = useSearchParams().get("email");

  return (
    <div className={styles.signIn}>
      <div className={styles.modal}>
        <div className={styles.frame}>
          <div className={styles.verifyCaption}>
            <h2 className={styles.title}>Periksa Email Anda</h2>
            <p className={styles.desc}>
              Kami sudah mengirimkan link login ke <b>{emailId}</b> yang berlaku
              dalam 5 menit.
            </p>
          </div>

          <div className={styles.container}>
            <img
              src="/icons/mailbox.svg"
              alt="Mailbox"
              className={styles.mailbox}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

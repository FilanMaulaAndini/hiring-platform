"use client";
import Link from "next/link";
import styles from "./Button.module.css"; 

export default function UnderlineButton({ link }) {

  return (
    <div className={styles.underlineButton}>
       <a href={link}>Masuk</a>
    </div>
  );
}
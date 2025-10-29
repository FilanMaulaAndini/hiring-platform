"use client";
import Link from "next/link";
import styles from "./Button.module.css"; 

export default function UnderlineButton({ link, text }) {

  return (
    <div className={styles.underlineButton}>
       <a href={link}>{text}</a>
    </div>
  );
}
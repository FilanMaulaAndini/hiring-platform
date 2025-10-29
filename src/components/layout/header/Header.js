"use client";

import styles from "./Header.module.css";
import { usePathname } from "next/navigation";
import { FaChevronRight } from "react-icons/fa6";
import { supabase } from "../../../../lib/supabase-client";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";

export default function Header() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const lastSegment = segments[segments.length - 1];
  const router = useRouter();
  const { toast, showToast } = useToast();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      showToast(error.message, "error");
    } else {
      router.push("/");
    }
  };

  const capitalizeWords = (str) =>
    str
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  const title =
    lastSegment && lastSegment !== "admin" ? capitalizeWords(lastSegment) : "";

  return (
    <header className={styles.header}>
      <nav className={styles.breadcrumb}>
        <a href="/admin" className={styles.breadcrumbItem}>
          Job list
        </a>
        {title && (
          <>
            <span>
              <FaChevronRight />
            </span>
            <span className={`${styles.breadcrumbItem} ${styles.active}`}>
              {title}
            </span>
          </>
        )}
      </nav>
      <div className={styles.wrapper} onClick={handleLogout}>
        <div>logout</div>
        <div className={styles.avatar}>👤</div>
      </div>
    </header>
  );
}

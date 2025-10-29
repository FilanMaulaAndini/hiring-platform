"use client";

import styles from "./Register.module.css";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BiError } from "react-icons/bi";
import { validateEmail } from "@/components/helper/validate-email";
import ErrorMessage from "@/components/ui/toast/ErrorMessage";
import UnderlineButton from "@/components/ui/button/UnderlineButton";
import { supabase } from "../../../../lib/supabase-client";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const router = useRouter();
  const [error, setError] = useState("");
  const [emailExist, setEmailExist] = useState("");

  const validate = (e) => {
    const errMsg = validateEmail(e.target.value);
    setError(errMsg);
    setEmail(e.target.value);
    setEmailExist("");
  };

  const checkEmailExists = async (email) => {
    const { data, error } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    return data !== null;
  };

  const handleRegisterClick = async () => {
    setError("");
    try {
      // const { data: authData, error: authError } = await supabase.auth.signInWithOtp({
      //   email: email,
      //   emailRedirectTo: `${window.location.origin}/auth/callback`,
      // });
      const exists = await checkEmailExists(email);
      if (exists) {
        setEmailExist(
          "Email ini sudah terdaftar sebagai akun di Rakamin Academy."
        );
        return;
      }

      const { data: authData, error: authError } =
        await supabase.auth.signInWithOtp({
          email: email,
          password: "Password123",
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

      await supabase.from("users").insert([
        {
          id: authData.user.id,
          email: authData.user.email,
          role: 2,
        },
      ]);

      if (error) {
        console.error(authError);
        setError("Error: " + authError.message);
      } else {
        router.push(
          `/sign-in/email-sent?email=${encodeURIComponent(authData.user.email)}`
        );
      }
    } catch (err) {
      console.error(err);
      setError("Unexpected error");
    }
  };

  return (
    <div className={styles.logInPage}>
      <div className={styles.registerBox}>
        <div className={styles.logo}>
          <Image src="/logo.svg" alt="Logo" width={145} height={50} />
        </div>
        <div className={styles.signUpBox}>
          <h2 className={styles.title}>Bergabung dengan Rakamin</h2>
          <div className={styles.subtitle}>
            <p>Sudah punya akun?</p>
            <UnderlineButton link="/" text={"Masuk"} />
          </div>
          {emailExist && (
            <div className={styles.tag}>
              <span className={styles.tagText}>{emailExist}</span>
            </div>
          )}
          <div className={`input-group`}>
            <label>Alamat Email</label>
            <input
              type="email"
              value={email}
              className={error ? "error" : ""}
              placeholder="Masukkan alamat email Anda"
              onChange={(e) => validate(e)}
            />
            {error && <ErrorMessage message={error} />}
          </div>
          <button className="btn btn-primary" onClick={handleRegisterClick}>
            Daftar dengan email
          </button>

          <div className={styles.divider}>
            <span></span>
            <p>atau</p>
            <span></span>
          </div>
          <button className="btn btn-secondary">
            <img src="/icons/google.svg" alt="Google" />
            Daftar dengan Google
          </button>
        </div>
      </div>
    </div>
  );
}

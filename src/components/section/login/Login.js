"use client";

import styles from "./Login.module.css";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { IoKeyOutline } from "react-icons/io5";
import { MdOutlineEmail } from "react-icons/md";
import { validateEmail } from "@/components/helper/validate-email";
import { useRouter } from "next/navigation";
import UnderlineButton from "@/components/ui/button/UnderlineButton";
import { supabase } from "../../../../lib/supabase-client";
import { useToast } from "@/context/ToastContext";
import ErrorMessage from "@/components/ui/toast/ErrorMessage";
import { IoEyeSharp } from "react-icons/io5";
import { FaEyeSlash } from "react-icons/fa";

export default function LoginPage() {
  const { toast, showToast } = useToast();
  const router = useRouter();
  const [includePassword, setIncludePassword] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [errorPass, setErrorPass] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const validate = (e) => {
    const errMsg = validateEmail(e.target.value);
    setError(errMsg);
    setEmail(e.target.value);
  };

  const handlePasswordClick = () => {
    setIncludePassword(!includePassword);
  };

  const handleLogin = async () => {

    if(!email){
      setError("Email wajib diisi.")
      return;
    }

    if(!password){
      setErrorPass("Password wajib diisi.")
      return;
    }

    try {
      const { data: { session }, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("role")
        .eq("id", session.user.id)
        .maybeSingle();

      if (userError) {
        console.error("User error:", userError);
        setError(userError.message);
        router.push("/");
        return;
      }

      if (error) {
        console.error(error);
        showToast(error.message, "error");
      } else {
        if (userData.role === 1) {
          router.push("/admin");
        } else if (userData.role === 2) {
          router.push("/candidate");
        } else {
          router.push("/");
        }
      }     
    } catch (err) {
      console.error(err);
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
            <p>Belum punya akun?</p>
            <UnderlineButton
              link={"/register"}
              text="Daftar di sini"
            ></UnderlineButton>
          </div>

          <div className="input-group">
            <label>Alamat Email</label>
            <input
              type="email"
              value={email}
              className={error ? "error" : ""}
              placeholder="Masukkan alamat email Anda"
              onChange={validate}
            />
            {error && <ErrorMessage message={error} />}
          </div>

          {includePassword && (
            <div className="input-group">
              <label>Kata Sandi</label>
              <div style={{ position: "relative", width: "100%" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  className={errorPass ? "error" : ""}
                  placeholder="Masukkan kata sandi Anda"
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: "100%",
                    paddingRight: "50px",
                  }}
                />

                <div
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    cursor: "pointer",
                    color: "#666",
                    fontSize: "14px",
                    userSelect: "none",
                  }}
                >
                  {showPassword ? <FaEyeSlash /> : <IoEyeSharp />}
                </div>
              </div>
              {errorPass && <ErrorMessage message={errorPass} />}
              <div className={`${styles.subtitle} ${styles.end}`}>
                <UnderlineButton
                  link={"#"}
                  text="Lupa kata sandi?"
                ></UnderlineButton>
              </div>
            </div>
          )}

          <button className="btn btn-primary" onClick={handleLogin}>
            {includePassword ? "Masuk" : "Kirim Link"}
          </button>

          <div className={styles.divider}>
            <span></span>
            <p>atau</p>
            <span></span>
          </div>

          <button className="btn btn-secondary" onClick={handlePasswordClick}>
            {includePassword ? <MdOutlineEmail /> : <IoKeyOutline />}
            {includePassword
              ? "Kirim link login melalui link"
              : "Masuk dengan kata sandi"}
          </button>
          <button className="btn btn-secondary">
            <img src="/icons/google.svg" alt="Google" />
            Daftar dengan Google
          </button>
        </div>
      </div>
    </div>
  );
}

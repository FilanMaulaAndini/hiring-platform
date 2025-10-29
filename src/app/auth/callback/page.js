"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabase-client";
import { useRouter } from "next/navigation";

export default function Callback() {
  const router = useRouter();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleSignIn = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          setError(sessionError.message);
          router.push("/");
          return;
        }

        if (!session) {
          router.push("/");
          return;
        }

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

        if (userData.role === 1) {
          router.push("/admin");
        } else if (userData.role === 2) {
          router.push("/candidate");
        } else {
          router.push("/");
        }
      } catch (err) {
        console.error("Error:", err);
        setError(err.message);
        router.push("/");
      }
    };

    handleSignIn();
  }, [router]);

  return (
    <div className="loader-wrapper">
      <div className="spinner" />
      <p style={{ marginTop: "1rem", fontWeight: 600 }}>
        Redirecting to sign in...
      </p>
    </div>
  );
}

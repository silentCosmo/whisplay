"use client";

import { useEffect, useState } from "react";

export default function GoogleLoginButton() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAuthStatus() {
      const res = await fetch("/api/oauth/status");
      if (res.ok) {
        const data = await res.json();
        setLoggedIn(data.loggedIn);
      }
      setLoading(false);
    }
    fetchAuthStatus();
  }, []);

  const handleLogin = () => {
    window.location.href = "/api/oauth/login"; // your OAuth login route
  };

  const handleLogout = async () => {
    await fetch("/api/oauth/logout"); // your logout route clearing cookies
    setLoggedIn(false);
  };

  if (loading) return <div>Loading...</div>;

  return loggedIn ? (
    <button
      onClick={handleLogout}
      className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 font-sm"
    >
      Logout
    </button>
  ) : (
    <button
      onClick={handleLogin}
      className="px-4 py-2 rounded bg-cyan-700 text-white hover:bg-cyan-600 font-medium"
    >
      Login
    </button>
  );
}

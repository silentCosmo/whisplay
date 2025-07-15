// components/GoogleLoginButton.js
"use client";

export default function GoogleLoginButton() {
  const handleLogin = () => {
    window.location.href = "/api/oauth/login";
  };

  return (
    <button
      onClick={handleLogin}
      className="px-4 py-2 rounded bg-[#4285F4] text-white hover:bg-blue-600 font-medium"
    >
      Login with Google
    </button>
  );
}

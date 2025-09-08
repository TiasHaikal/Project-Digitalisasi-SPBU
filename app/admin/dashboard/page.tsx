"use client";

import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    // Ambil dari localStorage
    const storedName = localStorage.getItem("userName");
    if (storedName) {
      setUserName(storedName);
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-2xl p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-800">
          Selamat Datang, {userName || "User"} 👋
        </h1>
        <p className="text-gray-600 mt-3 text-lg">
          Semoga harimu menyenangkan dan selamat bekerja 💻✨
        </p>
      </div>
    </div>
  );
}

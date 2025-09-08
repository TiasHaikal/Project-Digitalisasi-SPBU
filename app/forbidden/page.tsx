"use client";

import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gray-100 text-center">
      <h1 className="text-5xl font-bold text-red-600 mb-4">403</h1>
      <h2 className="text-2xl font-semibold mb-2">Forbidden</h2>
      <p className="text-gray-600 mb-6">
        Anda tidak memiliki akses ke halaman ini.
      </p>
      <Link
        href="/login"
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Kembali ke Login
      </Link>
    </div>
  );
}

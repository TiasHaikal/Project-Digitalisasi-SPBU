"use client";

import { useEffect, useState } from "react";
import API, { getPhotoUrl } from "@/lib/api"; // ⬅️ import getPhotoUrl
import Swal from "sweetalert2";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Attendance {
  id: number;
  user: {
    name: string;
    role: string;
  };
  spbu: {
    code_spbu: string;
  };
  photo?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
}

export default function RekapPage() {
  const [records, setRecords] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const fetchAttendances = async () => {
    setLoading(true);
    try {
      const res = await API.get("/employee/attendances");
      setRecords(res.data.data || res.data || []);
    } catch (err: any) {
      console.error(
        "fetch attendances error:",
        err.response?.data || err.message
      );
      Swal.fire("Error", "Gagal memuat data absensi!", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendances();
  }, []);

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-2xl p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 text-center">
          📊 Rekap Absensi
        </h1>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm">
                <th className="px-4 py-3 text-left">Nama</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">SPBU</th>
                <th className="px-4 py-3 text-center">Foto</th>
                <th className="px-4 py-3 text-center">Waktu</th>
                <th className="px-4 py-3 text-center">Lokasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-6">
                    Loading...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-6 text-gray-500 italic"
                  >
                    Tidak ada data absensi.
                  </td>
                </tr>
              ) : (
                records.map((item, index) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-gray-100 transition ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="px-4 py-3 font-medium">{item.user?.name}</td>
                    <td className="px-4 py-3">{item.user?.role}</td>
                    <td className="px-4 py-3">{item.spbu?.code_spbu}</td>
                    <td className="px-4 py-3 text-center">
                      {item.photo ? (
                        <img
                          src={getPhotoUrl(item.photo)}
                          alt="Foto"
                          className="w-14 h-14 object-cover rounded-full border mx-auto shadow-sm cursor-pointer"
                          onClick={() =>
                            Swal.fire({
                              title: "Detail Foto",
                              imageUrl: getPhotoUrl(item.photo),
                              imageAlt: "Foto Absensi",
                              showCloseButton: true,
                              showConfirmButton: false,
                              width: "auto",
                            })
                          }
                        />
                      ) : (
                        <span className="text-gray-100 italic">No Photo</span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-center">
                      {new Date(item.createdAt).toLocaleString("id-ID", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {item.latitude && item.longitude ? (
                        <a
                          href={`https://www.google.com/maps?q=${item.latitude},${item.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 font-medium hover:text-blue-800 transition"
                        >
                          📍 Lihat Lokasi
                        </a>
                      ) : (
                        <span className="text-gray-400 italic">
                          No Location
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

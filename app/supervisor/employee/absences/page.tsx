"use client";

import { useEffect, useState } from "react";
import API, { getPhotoUrl } from "@/lib/api";
import Swal from "sweetalert2";

interface Absence {
  id: number;
  user: {
    name: string;
    role: string;
  };
  spbu: {
    code_spbu: string;
  };
  jenisPengajuan: string;
  tanggalAwal: string;
  tanggalAkhir: string;
  alasan: string;
  lampiran?: string;
  createdAt: string;
}

export default function AbsencePage() {
  const [records, setRecords] = useState<Absence[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAbsences = async () => {
    setLoading(true);
    try {
      const res = await API.get("/employee/absences");
      setRecords(res.data.data || []);
    } catch (err: any) {
      console.error("fetch absences error:", err.response?.data || err.message);
      Swal.fire("Error", "Gagal memuat data izin/absensi!", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAbsences();
  }, []);

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-2xl p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 text-center">
          📌 Rekap Izin / Absensi
        </h1>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm">
                <th className="px-4 py-3 text-left">Nama</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">SPBU</th>
                <th className="px-4 py-3 text-left">Jenis</th>
                <th className="px-4 py-3 text-left">Tanggal</th>
                <th className="px-4 py-3 text-left">Alasan</th>
                <th className="px-4 py-3 text-center">Lampiran</th>
                <th className="px-4 py-3 text-center">Dibuat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-6">
                    Loading...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-6 text-gray-500 italic"
                  >
                    Tidak ada data izin/absensi.
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
                    <td className="px-4 py-3">{item.jenisPengajuan}</td>
                    <td className="px-4 py-3">
                      {new Date(item.tanggalAwal).toLocaleDateString("id-ID")}{" "}
                      s/d{" "}
                      {new Date(item.tanggalAkhir).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-4 py-3">{item.alasan}</td>
                    <td className="px-4 py-3 text-center">
                      {item.lampiran ? (
                        <img
                          src={getPhotoUrl(item.lampiran)}
                          alt="Lampiran"
                          className="w-14 h-14 object-cover rounded border mx-auto shadow-sm cursor-pointer"
                          onClick={() =>
                            Swal.fire({
                              title: "Detail Lampiran",
                              imageUrl: getPhotoUrl(item.lampiran),
                              imageAlt: "Foto Lampiran",
                              showCloseButton: true,
                              showConfirmButton: false,
                              width: "auto",
                            })
                          }
                        />
                      ) : (
                        <span className="text-gray-400 italic">No File</span>
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

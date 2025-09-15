"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import API, { getPhotoUrl } from "@/lib/api";
import Swal from "sweetalert2";

const fetcher = (url: string) => API.get(url).then((res) => res.data.data);

interface AbsenceHistory {
  id: number;
  user: { name: string };
  spbu: { code_spbu: string };
  jenisPengajuan: string;
  tanggalAwal: string;
  tanggalAkhir: string;
  alasan: string;
  lampiran?: string;
  createdAt: string;
}

export default function AbsencePage() {
  const [jenisPengajuan, setJenisPengajuan] = useState("IZIN");
  const [tanggalAwal, setTanggalAwal] = useState("");
  const [tanggalAkhir, setTanggalAkhir] = useState("");
  const [alasan, setAlasan] = useState("");
  const [lampiran, setLampiran] = useState<File | null>(null);

  const {
    data: history,
    isLoading,
    error,
  } = useSWR<AbsenceHistory[]>("/employee/absences/history", fetcher);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tanggalAwal || !tanggalAkhir || !alasan || !lampiran) {
      Swal.fire("Oops!", "Semua field wajib diisi!", "warning");
      return;
    }

    const formData = new FormData();
    formData.append("jenisPengajuan", jenisPengajuan);
    formData.append("tanggalAwal", new Date(tanggalAwal).toISOString());
    formData.append("tanggalAkhir", new Date(tanggalAkhir).toISOString());
    formData.append("alasan", alasan);
    formData.append("lampiran", lampiran);

    try {
      await API.post("/employee/absences", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      Swal.fire("Berhasil!", "Pengajuan izin berhasil dikirim.", "success");
      setTanggalAwal("");
      setTanggalAkhir("");
      setAlasan("");
      setLampiran(null);
      mutate("/employee/absences/history"); // refresh history
    } catch (err: any) {
      console.error("submit absence error:", err.response?.data || err.message);
      Swal.fire("Error", "Gagal mengirim pengajuan izin!", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 space-y-10">
      {/* Form Izin */}
      <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
          📝 Form Pengajuan Izin
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Jenis Pengajuan */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Jenis Pengajuan
            </label>
            <select
              value={jenisPengajuan}
              onChange={(e) => setJenisPengajuan(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="IZIN">IZIN</option>
              <option value="SAKIT">SAKIT</option>
            </select>
          </div>

          {/* Tanggal Awal */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Tanggal Awal
            </label>
            <input
              type="date"
              value={tanggalAwal}
              onChange={(e) => setTanggalAwal(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Tanggal Akhir */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Tanggal Akhir
            </label>
            <input
              type="date"
              value={tanggalAkhir}
              onChange={(e) => setTanggalAkhir(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Alasan */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Alasan
            </label>
            <textarea
              value={alasan}
              onChange={(e) => setAlasan(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            ></textarea>
          </div>

          {/* Lampiran */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Lampiran (Foto)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setLampiran(e.target.files?.[0] || null)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-3 rounded-lg transition-all duration-200"
          >
            ✅ Kirim Pengajuan
          </button>
        </form>
      </div>

      {/* History Pengajuan */}
      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-6 text-gray-800 text-center">
          📜 History Pengajuan Izin
        </h2>

        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm">
                <th className="px-4 py-3 text-left">Nama</th>
                <th className="px-4 py-3 text-left">SPBU</th>
                <th className="px-4 py-3 text-left">Jenis</th>
                <th className="px-4 py-3 text-left">Tanggal</th>
                <th className="px-4 py-3 text-left">Alasan</th>
                <th className="px-4 py-3 text-center">Lampiran</th>
                <th className="px-4 py-3 text-center">Dibuat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-6">
                    Loading...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-red-500">
                    Gagal memuat data.
                  </td>
                </tr>
              ) : !history || history.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-6 text-gray-500 italic"
                  >
                    Belum ada history pengajuan izin.
                  </td>
                </tr>
              ) : (
                history.map((item, index) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-gray-100 transition ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="px-4 py-3 font-medium">{item.user?.name}</td>
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
                          className="w-14 h-14 object-cover rounded border mx-auto shadow-sm"
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

"use client";

import { useRef, useState } from "react";
import Webcam from "react-webcam";
import dynamic from "next/dynamic";
import { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import useSWR, { mutate } from "swr";
import API, { getPhotoUrl } from "@/lib/api"; // ⬅️ pakai getPhotoUrl
import Swal from "sweetalert2";

// Import react-leaflet dinamis
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);

// fetcher untuk SWR
const fetcher = (url: string) => API.get(url).then((res) => res.data.data);

interface History {
  id: number;
  user: {
    name: string;
  };
  spbu: {
    code_spbu: string;
  };
  photo?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
}

export default function AttendancePage() {
  const webcamRef = useRef<Webcam>(null);
  const [position, setPosition] = useState<[number, number] | null>(null);

  // ambil history absensi
  const {
    data: history,
    error,
    isLoading,
  } = useSWR<History[]>("/employee/attendances/history", fetcher);

  // ambil lokasi GPS
  const getLocation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setPosition([pos.coords.latitude, pos.coords.longitude]);
    });
  };

  // handle submit absensi
  const handleSubmit = async () => {
    if (!webcamRef.current || !position) {
      Swal.fire("Oops!", "Foto & lokasi wajib diambil dulu!", "warning");
      return;
    }

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    const res = await fetch(imageSrc);
    const blob = await res.blob();
    const file = new File([blob], "photo.jpg", { type: "image/jpeg" });

    const formData = new FormData();
    formData.append("photo", file);
    formData.append("latitude", position[0].toString());
    formData.append("longitude", position[1].toString());

    try {
      await API.post("/employee/attendances", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      Swal.fire("Berhasil!", "Absensi berhasil dicatat.", "success");
      mutate("/employee/attendances/history"); // refresh history otomatis
    } catch (err: any) {
      console.error(
        "submit attendance error:",
        err.response?.data || err.message
      );
      Swal.fire("Error", "Gagal mengirim absensi!", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 space-y-10">
      {/* Form Absensi */}
      <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
          📋 Absensi Karyawan
        </h1>

        {/* Webcam */}
        <div className="mb-4 overflow-hidden rounded-xl border border-gray-300">
          <Webcam
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="w-full"
          />
        </div>

        {/* Tombol Ambil Lokasi */}
        <button
          onClick={getLocation}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-3 rounded-lg mb-4 transition-all duration-200"
        >
          📍 Ambil Lokasi
        </button>

        {/* Map */}
        {position && (
          <div className="rounded-xl overflow-hidden border border-gray-300 mb-4">
            <MapContainer
              center={position as LatLngExpression}
              zoom={16}
              style={{ height: "250px", width: "100%" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={position as LatLngExpression} />
            </MapContainer>
          </div>
        )}

        {/* Tombol Submit */}
        <button
          onClick={handleSubmit}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-3 rounded-lg transition-all duration-200"
        >
          ✅ Submit Absensi
        </button>
      </div>

      {/* History Absensi */}
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-6 text-gray-800 text-center">
          🕒 History Absensi
        </h2>

        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm">
                <th className="px-4 py-3 text-left">Nama</th>
                <th className="px-4 py-3 text-left">SPBU</th>
                <th className="px-4 py-3 text-center">Foto</th>
                <th className="px-4 py-3 text-center">Waktu</th>
                <th className="px-4 py-3 text-center">Lokasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-6">
                    Loading...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-red-500">
                    Gagal memuat data.
                  </td>
                </tr>
              ) : !history || history.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-6 text-gray-500 italic"
                  >
                    Belum ada history absensi.
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
                    <td className="px-4 py-3 text-center">
                      {item.photo ? (
                        <img
                          src={getPhotoUrl(item.photo) || ""}
                          alt="Foto"
                          className="w-14 h-14 object-cover rounded-full border mx-auto shadow-sm"
                        />
                      ) : (
                        <span className="text-gray-400 italic">No Photo</span>
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

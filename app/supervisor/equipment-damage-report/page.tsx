"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api";
import Swal from "sweetalert2";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface EquipmentDamage {
  id: number;
  spbu: {
    code_spbu: string;
  };
  namaUnit: string;
  deskripsiKerusakan: string;
  tindakanYangDilakukan: string;
  penanggungJawabPerbaikan: string;
  tanggalKerusakan: string | null;
  tanggalPemberitahuan: string | null;
  tanggalPerbaikan: string | null;
  tanggalPerbaikanSelesai: string | null;
  createdAt: string;
  updatedAt: string;
}

// helper: validasi tanggal
const toISOStringOrNull = (dateStr: string) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d.toISOString();
};

export default function EquipmentDamageReportPage() {
  const [reports, setReports] = useState<EquipmentDamage[]>([]);
  const [loading, setLoading] = useState(true);

  // modal states
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  // add states
  const [a_namaUnit, setA_NamaUnit] = useState<string>("");
  const [a_deskripsi, setA_Deskripsi] = useState<string>("");
  const [a_tindakan, setA_Tindakan] = useState<string>("");
  const [a_penanggung, setA_Penanggung] = useState<string>("");
  const [a_tglKerusakan, setA_TglKerusakan] = useState<string>("");
  const [a_tglPemberitahuan, setA_TglPemberitahuan] = useState<string>("");
  const [a_tglPerbaikan, setA_TglPerbaikan] = useState<string>("");
  const [a_tglSelesai, setA_TglSelesai] = useState<string>("");

  // edit states
  const [editing, setEditing] = useState<EquipmentDamage | null>(null);
  const [e_namaUnit, setE_NamaUnit] = useState<string>("");
  const [e_deskripsi, setE_Deskripsi] = useState<string>("");
  const [e_tindakan, setE_Tindakan] = useState<string>("");
  const [e_penanggung, setE_Penanggung] = useState<string>("");
  const [e_tglKerusakan, setE_TglKerusakan] = useState<string>("");
  const [e_tglPemberitahuan, setE_TglPemberitahuan] = useState<string>("");
  const [e_tglPerbaikan, setE_TglPerbaikan] = useState<string>("");
  const [e_tglSelesai, setE_TglSelesai] = useState<string>("");

  // fetch data
  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await API.get("/supervisor/equipment-damage-report");
      setReports(res.data.data || []);
    } catch (err: any) {
      console.error("fetch error:", err.response?.data || err.message);
      Swal.fire("Error", "Gagal memuat data laporan!", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // reset add form
  const resetAddForm = () => {
    setA_NamaUnit("");
    setA_Deskripsi("");
    setA_Tindakan("");
    setA_Penanggung("");
    setA_TglKerusakan("");
    setA_TglPemberitahuan("");
    setA_TglPerbaikan("");
    setA_TglSelesai("");
  };

  const handleAdd = async () => {
    if (!a_namaUnit || !a_deskripsi) {
      Swal.fire("Oops!", "Nama unit & deskripsi wajib diisi!", "warning");
      return;
    }

    try {
      const payload = {
        namaUnit: a_namaUnit,
        deskripsiKerusakan: a_deskripsi,
        tindakanYangDilakukan: a_tindakan,
        penanggungJawabPerbaikan: a_penanggung,
        tanggalKerusakan: toISOStringOrNull(a_tglKerusakan),
        tanggalPemberitahuan: toISOStringOrNull(a_tglPemberitahuan),
        tanggalPerbaikan: toISOStringOrNull(a_tglPerbaikan),
        tanggalPerbaikanSelesai: toISOStringOrNull(a_tglSelesai),
      };

      await API.post("/supervisor/equipment-damage-report", payload, {
        headers: { "Content-Type": "application/json" },
      });

      Swal.fire("Berhasil", "Laporan berhasil ditambahkan!", "success");
      resetAddForm();
      setOpenAdd(false);
      fetchReports();
    } catch (err: any) {
      console.error("add error:", err.response?.data || err.message);
      Swal.fire(
        "Error",
        err.response?.data?.message || "Gagal tambah data!",
        "error"
      );
    }
  };

  const openEditModal = (r: EquipmentDamage) => {
    setEditing(r);
    setE_NamaUnit(r.namaUnit);
    setE_Deskripsi(r.deskripsiKerusakan);
    setE_Tindakan(r.tindakanYangDilakukan);
    setE_Penanggung(r.penanggungJawabPerbaikan);
    setE_TglKerusakan(
      r.tanggalKerusakan ? r.tanggalKerusakan.slice(0, 16) : ""
    );
    setE_TglPemberitahuan(
      r.tanggalPemberitahuan ? r.tanggalPemberitahuan.slice(0, 16) : ""
    );
    setE_TglPerbaikan(
      r.tanggalPerbaikan ? r.tanggalPerbaikan.slice(0, 16) : ""
    );
    setE_TglSelesai(
      r.tanggalPerbaikanSelesai ? r.tanggalPerbaikanSelesai.slice(0, 16) : ""
    );
    setOpenEdit(true);
  };

  const handleUpdate = async () => {
    if (!editing) return;
    if (!e_namaUnit || !e_deskripsi) {
      Swal.fire("Oops!", "Nama unit & deskripsi wajib diisi!", "warning");
      return;
    }

    try {
      const payload = {
        namaUnit: e_namaUnit,
        deskripsiKerusakan: e_deskripsi,
        tindakanYangDilakukan: e_tindakan,
        penanggungJawabPerbaikan: e_penanggung,
        tanggalKerusakan: toISOStringOrNull(e_tglKerusakan),
        tanggalPemberitahuan: toISOStringOrNull(e_tglPemberitahuan),
        tanggalPerbaikan: toISOStringOrNull(e_tglPerbaikan),
        tanggalPerbaikanSelesai: toISOStringOrNull(e_tglSelesai),
      };

      await API.put(
        `/supervisor/equipment-damage-report/${editing.id}`,
        payload
      );

      Swal.fire("Berhasil", "Laporan berhasil diupdate!", "success");
      setOpenEdit(false);
      setEditing(null);
      fetchReports();
    } catch (err: any) {
      console.error("update error:", err.response?.data || err.message);
      Swal.fire(
        "Error",
        err.response?.data?.message || "Gagal update data!",
        "error"
      );
    }
  };

  const handleDelete = async (id: number) => {
    const confirm = await Swal.fire({
      title: "Yakin hapus?",
      text: "Data akan dihapus permanen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });
    if (!confirm.isConfirmed) return;

    try {
      await API.delete(`/supervisor/equipment-damage-report/${id}`);
      Swal.fire("Berhasil", "Data berhasil dihapus!", "success");
      fetchReports();
    } catch (err: any) {
      console.error("delete error:", err.response?.data || err.message);
      Swal.fire(
        "Error",
        err.response?.data?.message || "Gagal hapus data!",
        "error"
      );
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Equipment Damage Report</h1>
        <Button onClick={() => setOpenAdd(true)}>+ Tambah Laporan</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data Equipment Damage Report</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : reports.length === 0 ? (
            <p>Belum ada data.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>SPBU</TableHead>
                  <TableHead>Nama Unit</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead>Tindakan</TableHead>
                  <TableHead>PJ</TableHead>
                  <TableHead>Tgl Kerusakan</TableHead>
                  <TableHead>Tgl Pemberitahuan</TableHead>
                  <TableHead>Tgl Perbaikan</TableHead>
                  <TableHead>Tgl Selesai</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.id}</TableCell>
                    <TableCell>{r.spbu.code_spbu}</TableCell>
                    <TableCell>{r.namaUnit}</TableCell>
                    <TableCell>{r.deskripsiKerusakan}</TableCell>
                    <TableCell>{r.tindakanYangDilakukan}</TableCell>
                    <TableCell>{r.penanggungJawabPerbaikan}</TableCell>
                    <TableCell>
                      {r.tanggalKerusakan
                        ? new Date(r.tanggalKerusakan).toLocaleString()
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {r.tanggalPemberitahuan
                        ? new Date(r.tanggalPemberitahuan).toLocaleString()
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {r.tanggalPerbaikan
                        ? new Date(r.tanggalPerbaikan).toLocaleString()
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {r.tanggalPerbaikanSelesai
                        ? new Date(r.tanggalPerbaikanSelesai).toLocaleString()
                        : "-"}
                    </TableCell>
                    <TableCell className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(r)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(r.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal Tambah */}
      {openAdd && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-lg">
            <h2 className="text-xl font-semibold mb-6">
              Tambah Laporan Kerusakan
            </h2>

            <div className="space-y-3">
              <Input
                placeholder="Nama Unit"
                value={a_namaUnit}
                onChange={(e) => setA_NamaUnit(e.target.value)}
              />
              <Input
                placeholder="Deskripsi Kerusakan"
                value={a_deskripsi}
                onChange={(e) => setA_Deskripsi(e.target.value)}
              />
              <Input
                placeholder="Tindakan"
                value={a_tindakan}
                onChange={(e) => setA_Tindakan(e.target.value)}
              />
              <Input
                placeholder="Penanggung Jawab"
                value={a_penanggung}
                onChange={(e) => setA_Penanggung(e.target.value)}
              />

              <div>
                <label className="block text-sm font-medium mb-1">
                  Tanggal Kerusakan
                </label>
                <Input
                  type="datetime-local"
                  value={a_tglKerusakan}
                  onChange={(e) => setA_TglKerusakan(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Tanggal Pemberitahuan
                </label>
                <Input
                  type="datetime-local"
                  value={a_tglPemberitahuan}
                  onChange={(e) => setA_TglPemberitahuan(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Tanggal Perbaikan
                </label>
                <Input
                  type="datetime-local"
                  value={a_tglPerbaikan}
                  onChange={(e) => setA_TglPerbaikan(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Tanggal Perbaikan Selesai
                </label>
                <Input
                  type="datetime-local"
                  value={a_tglSelesai}
                  onChange={(e) => setA_TglSelesai(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setOpenAdd(false)}>
                Batal
              </Button>
              <Button onClick={handleAdd}>Simpan</Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit */}
      {openEdit && editing && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-lg">
            <h2 className="text-xl font-semibold mb-6">
              Edit Laporan Kerusakan
            </h2>

            <div className="space-y-3">
              <Input
                placeholder="Nama Unit"
                value={e_namaUnit}
                onChange={(e) => setE_NamaUnit(e.target.value)}
              />
              <Input
                placeholder="Deskripsi Kerusakan"
                value={e_deskripsi}
                onChange={(e) => setE_Deskripsi(e.target.value)}
              />
              <Input
                placeholder="Tindakan"
                value={e_tindakan}
                onChange={(e) => setE_Tindakan(e.target.value)}
              />
              <Input
                placeholder="Penanggung Jawab"
                value={e_penanggung}
                onChange={(e) => setE_Penanggung(e.target.value)}
              />

              <div>
                <label className="block text-sm font-medium mb-1">
                  Tanggal Kerusakan
                </label>
                <Input
                  type="datetime-local"
                  value={e_tglKerusakan}
                  onChange={(e) => setE_TglKerusakan(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Tanggal Pemberitahuan
                </label>
                <Input
                  type="datetime-local"
                  value={e_tglPemberitahuan}
                  onChange={(e) => setE_TglPemberitahuan(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Tanggal Perbaikan
                </label>
                <Input
                  type="datetime-local"
                  value={e_tglPerbaikan}
                  onChange={(e) => setE_TglPerbaikan(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Tanggal Perbaikan Selesai
                </label>
                <Input
                  type="datetime-local"
                  value={e_tglSelesai}
                  onChange={(e) => setE_TglSelesai(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setOpenEdit(false)}>
                Batal
              </Button>
              <Button onClick={handleUpdate}>Update</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

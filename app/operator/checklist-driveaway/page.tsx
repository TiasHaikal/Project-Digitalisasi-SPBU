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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ChecklistDriveway {
  id: number;
  tanggal: string;
  shift: string;
  elemen: string;
  aktifitasDriveway: string;
  checklistStatus: string;
  spbu?: { code_spbu: string };
  user?: { name: string };
}

export default function ChecklistDrivewayPage() {
  const [checklists, setChecklists] = useState<ChecklistDriveway[]>([]);
  const [loading, setLoading] = useState(true);

  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editing, setEditing] = useState<ChecklistDriveway | null>(null);
  const [form, setForm] = useState<any>({});

  const setField = (key: string, value: any) =>
    setForm((prev: any) => ({ ...prev, [key]: value }));

  const fetchChecklists = async () => {
    setLoading(true);
    try {
      const res = await API.get("/operator/checklist-driveway");
      setChecklists(res.data.data || []);
    } catch (err: any) {
      Swal.fire("Error", "Gagal memuat data checklist driveway!", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChecklists();
  }, []);

  const resetForm = () => setForm({});

  const openAdd = () => {
    resetForm();
    setOpenAddModal(true);
  };

  const openEdit = (c: ChecklistDriveway) => {
    setEditing(c);
    setForm({
      ...c,
      tanggal: c.tanggal.slice(0, 16), // format datetime-local
    });
    setOpenEditModal(true);
  };

  const handleAdd = async () => {
    try {
      const formData = new URLSearchParams();
      formData.append("tanggal", new Date(form.tanggal).toISOString());
      formData.append("shift", form.shift);
      formData.append("elemen", form.elemen);
      formData.append("aktifitasDriveway", form.aktifitasDriveway);
      formData.append("checklistStatus", form.checklistStatus);

      await API.post("/operator/checklist-driveway", formData);
      Swal.fire("Berhasil", "Checklist berhasil ditambahkan!", "success");
      setOpenAddModal(false);
      fetchChecklists();
    } catch (err: any)      {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Gagal tambah data!",
        "error"
      );
    }
  };

  const handleUpdate = async () => {
    if (!editing) return;
    try {
      const formData = new URLSearchParams();
      formData.append("tanggal", new Date(form.tanggal).toISOString());
      formData.append("shift", form.shift);
      formData.append("elemen", form.elemen);
      formData.append("aktifitasDriveway", form.aktifitasDriveway);
      formData.append("checklistStatus", form.checklistStatus);

      await API.put(`/operator/checklist-driveway/${editing.id}`, formData);

      Swal.fire("Berhasil", "Checklist berhasil diupdate!", "success");
      setOpenEditModal(false);
      setEditing(null);
      fetchChecklists();
    } catch (err: any) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Gagal update data!",
        "error"
      );
    }
  };

  const handleDelete = async (id: number) => {
    const confirm = await Swal.fire({
      title: "Yakin?",
      text: "Data akan dihapus permanen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });
    if (!confirm.isConfirmed) return;
    try {
      await API.delete(`/operator/checklist-driveway/${id}`);
      Swal.fire("Berhasil", "Data berhasil dihapus!", "success");
      fetchChecklists();
    } catch (err: any) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Gagal hapus data!",
        "error"
      );
    }
  };

  const renderFormFields = () => (
    <>
      <div>
        <label>Tanggal</label>
        <Input
          type="datetime-local"
          value={form.tanggal || ""}
          onChange={(e) => setField("tanggal", e.target.value)}
        />
      </div>
      <div>
        <label>Shift</label>
        <Select
          value={form.shift || ""}
          onValueChange={(v) => setField("shift", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih Shift" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PAGI">PAGI</SelectItem>
            <SelectItem value="SIANG">SIANG</SelectItem>
            <SelectItem value="MALAM">MALAM</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label>Elemen</label>
        <Select
          value={form.elemen || ""}
          onValueChange={(v) => setField("elemen", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih Elemen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DRIVEWAY">DRIVEWAY</SelectItem>
            <SelectItem value="PULAU">PULAU</SelectItem>
            <SelectItem value="KANOPI">KANOPI</SelectItem>
            <SelectItem value="SIGNAGE">SIGNAGE</SelectItem>
            <SelectItem value="OIL">OIL</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label>Aktifitas Driveway</label>
        <Select
          value={form.aktifitasDriveway || ""}
          onValueChange={(v) => setField("aktifitasDriveway", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih Aktifitas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PERIKSA_KERUSAKAN_SECARA_VISUAL">
              PERIKSA KERUSAKAN SECARA VISUAL
            </SelectItem>
            <SelectItem value="SAPU_DAERAH_DRIVEWAY_DAN_SEKITARNYA">
              SAPU DAERAH DRIVEWAY DAN SEKITARNYA
            </SelectItem>
            <SelectItem value="CUCI_DRIVEWAY_DENGAN_SIKAT_DAN_DETERGEN">
              CUCI DRIVEWAY DENGAN SIKAT DAN DETERGEN
            </SelectItem>
            <SelectItem value="CUCI_PULAU_DENGAN_SIKAT_DAN_DETERGEN">
              CUCI PULAU DENGAN SIKAT DAN DETERGEN
            </SelectItem>
            <SelectItem value="PEMERIKSAAN_VISUAL_KESULITAN_DAN_KEBERSIHAN">
              PEMERIKSAAN VISUAL KESULITAN DAN KEBERSIHAN
            </SelectItem>
            <SelectItem value="PERIKSA_FUNGSI_LAMPU">
              PERIKSA FUNGSI LAMPU
            </SelectItem>
            <SelectItem value="PERIKSA_LAMPU">PERIKSA LAMPU</SelectItem>
            <SelectItem value="PERIKSA_KEDALAMAN_DAN_KEBERSIHAN">
              PERIKSA KEDALAMAN DAN KEBERSIHAN
            </SelectItem>
            <SelectItem value="KURAS">KURAS</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label>Status Checklist</label>
        <Select
          value={form.checklistStatus || ""}
          onValueChange={(v) => setField("checklistStatus", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TERLAKSANA">TERLAKSANA</SelectItem>
            <SelectItem value="BERSIH">BERSIH</SelectItem>
            <SelectItem value="TIDAK_BERSIH">TIDAK BERSIH</SelectItem>
            <SelectItem value="ADA_KERUSAKAN">ADA KERUSAKAN</SelectItem>
            <SelectItem value="BELUM_DILAKUKAN">BELUM DILAKUKAN</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Checklist Driveway</h1>
        <Button onClick={openAdd}>+ Tambah Data</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data Checklist Driveway</CardTitle>
        </CardHeader>

        {/* --- BAGIAN YANG DIPERBAIKI UNTUK MENGHILANGKAN HYDRATION ERROR --- */}
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : checklists.length === 0 ? (
            <p>Belum ada data checklist driveway.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>SPBU</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Shift</TableHead>
                  <TableHead>Elemen</TableHead>
                  <TableHead>Aktifitas</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {checklists.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.id}</TableCell>
                    <TableCell>{c.spbu?.code_spbu}</TableCell>
                    <TableCell>{c.user?.name}</TableCell>
                    <TableCell>
                      {new Date(c.tanggal).toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell>{c.shift}</TableCell>
                    <TableCell>{c.elemen}</TableCell>
                    <TableCell>
                      {c.aktifitasDriveway.replace(/_/g, " ")}
                    </TableCell>
                    <TableCell>
                      {c.checklistStatus.replace(/_/g, " ")}
                    </TableCell>
                    <TableCell className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEdit(c)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(c.id)}
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
      {openAddModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-3xl">
            <h2 className="text-xl font-semibold mb-4">
              Tambah Checklist Driveway
            </h2>
            <div className="grid grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
              {renderFormFields()}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setOpenAddModal(false)}>
                Batal
              </Button>
              <Button onClick={handleAdd}>Simpan</Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit */}
      {openEditModal && editing && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-3xl">
            <h2 className="text-xl font-semibold mb-4">
              Edit Checklist Driveway
            </h2>
            <div className="grid grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
              {renderFormFields()}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setOpenEditModal(false);
                  setEditing(null);
                }}
              >
                Batal
              </Button>
              <Button onClick={handleUpdate}>Simpan</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
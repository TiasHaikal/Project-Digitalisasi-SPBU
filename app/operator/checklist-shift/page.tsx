"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api";
import Swal from "sweetalert2";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Menggunakan Textarea untuk keterangan
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

// 1. Interface disesuaikan dengan field-field baru
interface ChecklistShift {
  id: number;
  tanggal: string;
  shift: string;
  perawatanNozzle: string;
  perawatanBadanDispenser: string;
  perawatanDisplay: string;
  perawatanSelangNozzle: string;
  perawatanLantaiPulau: string;
  perawatanDriveway: string;
  perawatanLaci: string;
  perawatanTiangKanopiLampu: string;
  keterangan: string;
  spbu?: { code_spbu: string };
  user?: { name: string };
}

// 2. Nama komponen diubah
export default function ChecklistShiftPage() {
  const [checklists, setChecklists] = useState<ChecklistShift[]>([]);
  const [loading, setLoading] = useState(true);

  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editing, setEditing] = useState<ChecklistShift | null>(null);
  const [form, setForm] = useState<any>({});

  const setField = (key: string, value: any) =>
    setForm((prev: any) => ({ ...prev, [key]: value }));

  const fetchChecklists = async () => {
    setLoading(true);
    try {
      // 3. Endpoint API diubah
      const res = await API.get("/operator/checklist-shift");
      setChecklists(res.data.data || []);
    } catch (err: any) {
      Swal.fire("Error", "Gagal memuat data checklist awal shift!", "error");
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

  const openEdit = (c: ChecklistShift) => {
    setEditing(c);
    setForm({
      ...c,
      tanggal: c.tanggal.slice(0, 16), // format datetime-local
    });
    setOpenEditModal(true);
  };

  // Fungsi untuk membuat payload FormData
  const createPayload = () => {
    const formData = new URLSearchParams();
    formData.append("tanggal", new Date(form.tanggal).toISOString());
    formData.append("shift", form.shift);
    formData.append("perawatanNozzle", form.perawatanNozzle);
    formData.append("perawatanBadanDispenser", form.perawatanBadanDispenser);
    formData.append("perawatanDisplay", form.perawatanDisplay);
    formData.append("perawatanSelangNozzle", form.perawatanSelangNozzle);
    formData.append("perawatanLantaiPulau", form.perawatanLantaiPulau);
    formData.append("perawatanDriveway", form.perawatanDriveway);
    formData.append("perawatanLaci", form.perawatanLaci);
    formData.append(
      "perawatanTiangKanopiLampu",
      form.perawatanTiangKanopiLampu
    );
    formData.append("keterangan", form.keterangan);
    return formData;
  };

  const handleAdd = async () => {
    try {
      const payload = createPayload();
      await API.post("/operator/checklist-shift", payload);
      Swal.fire("Berhasil", "Checklist berhasil ditambahkan!", "success");
      setOpenAddModal(false);
      fetchChecklists();
    } catch (err: any) {
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
      const payload = createPayload();
      await API.put(`/operator/checklist-shift/${editing.id}`, payload);
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
      await API.delete(`/operator/checklist-shift/${id}`);
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

  // Komponen helper untuk field Select
  const StatusSelect = ({
    label,
    fieldKey,
  }: {
    label: string;
    fieldKey: keyof ChecklistShift;
  }) => (
    <div>
      <label>{label}</label>
      <Select
        value={form[fieldKey] || ""}
        onValueChange={(v) => setField(fieldKey, v)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Pilih Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="TERLAKSANA">TERLAKSANA</SelectItem>
          <SelectItem value="BELUM_DILAKUKAN">BELUM DILAKUKAN</SelectItem>
          <SelectItem value="ADA_KERUSAKAN">ADA KERUSAKAN</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  // 4. Form diubah total untuk field-field baru
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

      <StatusSelect label="Perawatan Nozzle" fieldKey="perawatanNozzle" />
      <StatusSelect
        label="Perawatan Badan Dispenser"
        fieldKey="perawatanBadanDispenser"
      />
      <StatusSelect label="Perawatan Display" fieldKey="perawatanDisplay" />
      <StatusSelect
        label="Perawatan Selang Nozzle"
        fieldKey="perawatanSelangNozzle"
      />
      <StatusSelect
        label="Perawatan Lantai Pulau"
        fieldKey="perawatanLantaiPulau"
      />
      <StatusSelect label="Perawatan Driveway" fieldKey="perawatanDriveway" />
      <StatusSelect label="Perawatan Laci" fieldKey="perawatanLaci" />
      <StatusSelect
        label="Perawatan Tiang Kanopi & Lampu"
        fieldKey="perawatanTiangKanopiLampu"
      />

      <div className="col-span-2">
        <label>Keterangan</label>
        <Textarea
          placeholder="Masukkan keterangan..."
          value={form.keterangan || ""}
          onChange={(e) => setField("keterangan", e.target.value)}
        />
      </div>
    </>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Checklist Awal Shift</h1>
        <Button onClick={openAdd}>+ Tambah Data</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data Checklist Awal Shift</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : checklists.length === 0 ? (
            <p>Belum ada data checklist awal shift.</p>
          ) : (
            // 5. Tabel disederhanakan agar tidak terlalu lebar
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>SPBU</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Shift</TableHead>
                  <TableHead>Keterangan</TableHead>
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
                    <TableCell>{c.keterangan}</TableCell>
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
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl">
            {" "}
            {/* Dibuat lebih lebar */}
            <h2 className="text-xl font-semibold mb-4">
              Tambah Checklist Awal Shift
            </h2>
            <div className="grid grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto p-2">
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
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl">
            {" "}
            {/* Dibuat lebih lebar */}
            <h2 className="text-xl font-semibold mb-4">
              Edit Checklist Awal Shift
            </h2>
            <div className="grid grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto p-2">
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

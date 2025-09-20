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
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
  const [exportMonth, setExportMonth] = useState<string>(
    (new Date().getMonth() + 1).toString()
  );
  const [exportYear, setExportYear] = useState<string>(
    new Date().getFullYear().toString()
  );

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

  const handleExportPDF = () => {
    if (!exportMonth || !exportYear) {
      Swal.fire(
        "Gagal",
        "Silakan pilih bulan dan tahun untuk ekspor.",
        "error"
      );
      return;
    }
    const month = parseInt(exportMonth, 10) - 1;
    const year = parseInt(exportYear, 10);

    const filteredChecklists = checklists.filter((c) => {
      const date = new Date(c.tanggal);
      return date.getMonth() === month && date.getFullYear() === year;
    });

    if (filteredChecklists.length === 0) {
      Swal.fire(
        "Info",
        "Tidak ada data pada bulan dan tahun yang dipilih.",
        "info"
      );
      return;
    }

    const doc = new jsPDF({ orientation: "landscape" });
    const spbu = filteredChecklists[0]?.spbu?.code_spbu || "N/A";
    const monthName = new Date(year, month).toLocaleString("id-ID", {
      month: "long",
    });

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(
      "CHECKLIST KEBERSIHAN DAN PERAWATAN DI AWAL SHIFT",
      doc.internal.pageSize.getWidth() / 2,
      15,
      { align: "center" }
    );

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    // --- PERBAIKAN: Menambahkan kembali "Bulan" dan "Tahun" ---
    doc.text(`No. SPBU: ${spbu}`, 14, 25);
    doc.text(`Nama Foreman:`, 14, 30);
    doc.text(`Shift/Pagi / Siang / Malam`, 14, 35);
    doc.text(`Bulan: ${monthName.toUpperCase()} ${year}`, 14, 40); // Ditambahkan di sini

    const formatStatus = (status: string) => (status || "").replace(/_/g, " ");

    const head = [
      [
        {
          content: "No.",
          rowSpan: 2,
          styles: { halign: "center" as const, valign: "middle" as const },
        },
        {
          content: "Nama Operator, Tanggal & Shift",
          rowSpan: 2,
          styles: { halign: "center" as const, valign: "middle" as const },
        },
        {
          content: "Kebersihan & perawatan",
          colSpan: 4,
          styles: { halign: "center" as const },
        },
        {
          content: "Kebersihan Area lain",
          colSpan: 3,
          styles: { halign: "center" as const },
        },
        {
          content: "Keterangan",
          rowSpan: 2,
          styles: { halign: "center" as const, valign: "middle" as const },
        },
      ],
      [
        { content: "Nozzle", styles: { halign: "center" as const } },
        { content: "Badan dispenser", styles: { halign: "center" as const } },
        { content: "Display", styles: { halign: "center" as const } },
        { content: "Selang", styles: { halign: "center" as const } },
        {
          content: "Lantai pulau & Driveway",
          colSpan: 2,
          styles: { halign: "center" as const },
        },
        {
          content: "Tiang kanopi / Lampu",
          styles: { halign: "center" as const },
        },
      ],
    ];

    const body = filteredChecklists.map((c, index) => [
      index + 1,
      `${c.user?.name || ""}\n(${new Date(c.tanggal).toLocaleString(
        "id-ID"
      )})\n(${c.shift})`,
      formatStatus(c.perawatanNozzle),
      formatStatus(c.perawatanBadanDispenser),
      formatStatus(c.perawatanDisplay),
      formatStatus(c.perawatanSelangNozzle),
      formatStatus(c.perawatanLantaiPulau),
      formatStatus(c.perawatanDriveway),
      formatStatus(c.perawatanTiangKanopiLampu),
      c.keterangan,
    ]);

    autoTable(doc, {
      head: head,
      body: body,
      startY: 45, // Sesuaikan startY karena ada baris tambahan
      theme: "grid",
      styles: { fontSize: 7, halign: "center", valign: "middle" },
      headStyles: {
        fontStyle: "bold",
        fillColor: [220, 220, 220],
        textColor: 0,
        fontSize: 8,
      },
      columnStyles: {
        0: { cellWidth: 8 },
        1: { cellWidth: 35, halign: "left" },
        9: { cellWidth: "auto", halign: "left" },
      },
    });

    const finalY = (doc as any).lastAutoTable.finalY;
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("Keterangan Status:", 14, finalY + 10);
    doc.setFont("helvetica", "normal");
    doc.text("TERLAKSANA, BELUM DILAKUKAN, ADA KERUSAKAN", 14, finalY + 14);

    doc.save(`Checklist_Awal_Shift_${spbu}.pdf`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Checklist Awal Shift</h1>
        <div className="flex items-center gap-2">
          <Select value={exportMonth} onValueChange={setExportMonth}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Bulan" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => (
                <SelectItem key={i} value={(i + 1).toString()}>
                  {new Date(0, i).toLocaleString("id-ID", { month: "long" })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={exportYear} onValueChange={setExportYear}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Tahun" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 5 }, (_, i) => (
                <SelectItem
                  key={i}
                  value={(new Date().getFullYear() - i).toString()}
                >
                  {new Date().getFullYear() - i}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExportPDF}>
            Export PDF
          </Button>
          <Button onClick={openAdd}>+ Tambah Data</Button>
        </div>
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

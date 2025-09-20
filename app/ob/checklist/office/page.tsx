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
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// 1. Interface disesuaikan untuk Kantor
interface ChecklistOffice {
  id: number;
  tanggal: string;
  shift: string;
  aktifitasOffice: string; // Diubah
  checklistStatus: string;
  spbu?: { code_spbu: string };
  user?: { name: string };
}

// 2. Nama komponen diubah
export default function ChecklistOfficePage() {
  const [checklists, setChecklists] = useState<ChecklistOffice[]>([]);
  const [loading, setLoading] = useState(true);

  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editing, setEditing] = useState<ChecklistOffice | null>(null);
  const [form, setForm] = useState<any>({});


  const setField = (key: string, value: any) =>
    setForm((prev: any) => ({ ...prev, [key]: value }));

  const fetchChecklists = async () => {
    setLoading(true);
    try {
      // 3. Endpoint API diubah ke /ob/checklist-office
      const res = await API.get("/ob/checklist-office");
      setChecklists(res.data.data || []);
    } catch (err: any) {
      Swal.fire("Error", "Gagal memuat data checklist kantor!", "error");
    } finally {
      setLoading(false);
    }
  };
 const [exportMonth, setExportMonth] = useState<string>((new Date().getMonth() + 1).toString());
  const [exportYear, setExportYear] = useState<string>(new Date().getFullYear().toString());

  useEffect(() => {
    fetchChecklists();
  }, []);

  const resetForm = () => setForm({});

  const openAdd = () => {
    resetForm();
    setOpenAddModal(true);
  };

  const openEdit = (c: ChecklistOffice) => {
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
      // 4. Field disesuaikan menjadi aktifitasOffice
      formData.append("aktifitasOffice", form.aktifitasOffice);
      formData.append("checklistStatus", form.checklistStatus);

      // Endpoint API diubah
      await API.post("/ob/checklist-office", formData);
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
      const formData = new URLSearchParams();
      formData.append("tanggal", new Date(form.tanggal).toISOString());
      formData.append("shift", form.shift);
      // Field disesuaikan menjadi aktifitasOffice
      formData.append("aktifitasOffice", form.aktifitasOffice);
      formData.append("checklistStatus", form.checklistStatus);

      // Endpoint API diubah
      await API.put(`/ob/checklist-office/${editing.id}`, formData);

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
      // Endpoint API diubah
      await API.delete(`/ob/checklist-office/${id}`);
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

  // 5. Daftar aktivitas di dropdown diubah sesuai gambar
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
        <label>Aktifitas Kantor</label>
        <Select
          value={form.aktifitasOffice || ""}
          onValueChange={(v) => setField("aktifitasOffice", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih Aktifitas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PERIKSA_KEBERSIHAN_DAN_KERUSAKAN_SECARA_VISUAL">
              PERIKSA KEBERSIHAN DAN KERUSAKAN SECARA VISUAL
            </SelectItem>
            <SelectItem value="SAPU_LANTAI">SAPU LANTAI</SelectItem>
            <SelectItem value="PEL_LANTAI">PEL LANTAI</SelectItem>
            <SelectItem value="LAP_JENDELA_KUSEN_DAN_LIPSLANK">
              LAP JENDELA KUSEN DAN LIPSLANK
            </SelectItem>
            <SelectItem value="LAP_PERABOTAN_KANTOR">
              LAP PERABOTAN KANTOR
            </SelectItem>
            <SelectItem value="BERSIHKAN_TEMPAT_SAMPAH">
              BERSIHKAN TEMPAT SAMPAH
            </SelectItem>
            <SelectItem value="GANTI_DAN_CUCI_KESET_PINTU">
              GANTI DAN CUCI KESET PINTU
            </SelectItem>
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
const handleExportPDF = () => {
    if (!exportMonth || !exportYear) {
      Swal.fire("Gagal", "Silakan pilih bulan dan tahun untuk ekspor.", "error");
      return;
    }
    const month = parseInt(exportMonth, 10) - 1;
    const year = parseInt(exportYear, 10);

    const filteredChecklists = checklists.filter(c => {
      const date = new Date(c.tanggal);
      return date.getMonth() === month && date.getFullYear() === year;
    });

    if (filteredChecklists.length === 0) {
      Swal.fire("Info", "Tidak ada data checklist pada bulan dan tahun yang dipilih.", "info");
      return;
    }

    const spbu = filteredChecklists[0]?.spbu?.code_spbu || "N/A";
    const monthName = new Date(year, month).toLocaleString('id-ID', { month: 'long' });
    const uniqueShifts = [...new Set(filteredChecklists.map(c => c.shift))].join(', ');
    
    const doc = new jsPDF({ orientation: "landscape" });

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("CHECKLIST KEGIATAN HOUSEKEEPING KANTOR", doc.internal.pageSize.getWidth() / 2, 15, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`SPBU: ${spbu}`, 14, 25);
    doc.text(`Bulan: ${monthName.toUpperCase()} ${year}`, 14, 30);
    doc.text(`Shift: ${uniqueShifts}`, 14, 35);

    const statusMap: { [key: string]: string } = {
        'TERLAKSANA': 'T', 'BERSIH': 'B', 'TIDAK_BERSIH': 'TB',
        'ADA_KERUSAKAN': 'AK', 'BELUM_DILAKUKAN': 'BD'
    };
    const shiftMap: { [key: string]: string } = {
        'PAGI': 'P', 'SIANG': 'S', 'MALAM': 'M'
    };

    const activities = [
        { value: "PERIKSA_KEBERSIHAN_DAN_KERUSAKAN_SECARA_VISUAL", label: "Periksa kebersihan dan kerusakan secara visual" },
        { value: "SAPU_LANTAI", label: "Sapu lantai" }, { value: "PEL_LANTAI", label: "Pel lantai" },
        { value: "LAP_JENDELA_KUSEN_DAN_LIPSLANK", label: "Lap jendela, kusen, dan lisplank" },
        { value: "LAP_PERABOTAN_KANTOR", label: "Lap perabotan kantor" },
        { value: "BERSIHKAN_TEMPAT_SAMPAH", label: "Bersihkan tempat sampah" },
        { value: "GANTI_DAN_CUCI_KESET_PINTU", label: "Ganti dan cuci keset pintu" },
    ];
    
    const head = [["Aktifitas", ...Array.from({ length: 31 }, (_, i) => (i + 1).toString()), "Paraf Supervisor"]];
    const body = activities.map(activity => {
      const row: (string | number)[] = Array(33).fill('');
      row[0] = activity.label;
      const checksForActivity = filteredChecklists.filter(c => c.aktifitasOffice === activity.value);
      
      checksForActivity.forEach(c => {
        const day = new Date(c.tanggal).getDate();
        const currentCell = row[day] as string;
        
        const statusAbbr = statusMap[c.checklistStatus] || '';
        const shiftAbbr = shiftMap[c.shift] || '';
        const newEntry = `${statusAbbr} (${shiftAbbr})`;

        row[day] = currentCell ? `${currentCell}\n${newEntry}` : newEntry;
      });
      return row;
    });

    autoTable(doc, {
      head: head,
      body: body,
      startY: 40,
      theme: 'grid',
      styles: { fontSize: 7, cellPadding: 1 },
      headStyles: { fontSize: 8, fillColor: [220, 220, 220], textColor: 0, fontStyle: 'bold', halign: 'center' },
      // --- PERBAIKAN UTAMA PADA LEBAR KOLOM ---
      columnStyles: {
        0: { cellWidth: 45, fontStyle: 'bold', fontSize: 8 }, // Aktifitas
        ...Object.fromEntries(Array.from({ length: 31 }, (_, i) => [i + 1, { cellWidth: 6.8, halign: 'center' }])), // Tanggal 1-31
        32: { cellWidth: 20 }, // Paraf Supervisor
      }
    });

    const finalY = (doc as any).lastAutoTable.finalY;
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("Keterangan (Legend):", 14, finalY + 10);
    doc.setFont("helvetica", "normal");
    doc.text("Status: T (Terlaksana), B (Bersih), TB (Tidak Bersih), AK (Ada Kerusakan), BD (Belum Dilakukan)", 14, finalY + 14);
    doc.text("Shift: P (Pagi), S (Siang), M (Malam)", 14, finalY + 18);

    doc.save(`Checklist_Kantor_${spbu}_${monthName}_${year}.pdf`);
  };

  return (
    // 6. Semua teks "..." diubah menjadi "Kantor"
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Checklist Kantor</h1>
          <div className="flex items-center gap-2">
             <Select value={exportMonth} onValueChange={setExportMonth}>
              <SelectTrigger className="w-[120px]"><SelectValue placeholder="Bulan" /></SelectTrigger>
              <SelectContent>{Array.from({ length: 12 }, (_, i) => (<SelectItem key={i} value={(i + 1).toString()}>{new Date(0, i).toLocaleString('id-ID', { month: 'long' })}</SelectItem>))}</SelectContent>
            </Select>
            <Select value={exportYear} onValueChange={setExportYear}>
                <SelectTrigger className="w-[100px]"><SelectValue placeholder="Tahun" /></SelectTrigger>
                <SelectContent>{Array.from({ length: 5 }, (_, i) => (<SelectItem key={i} value={(new Date().getFullYear() - i).toString()}>{new Date().getFullYear() - i}</SelectItem>))}</SelectContent>
            </Select>
            <Button variant="outline" onClick={handleExportPDF}>Export PDF</Button>
        <Button onClick={openAdd}>+ Tambah Data</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data Checklist Kantor</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : checklists.length === 0 ? (
            <p>Belum ada data checklist kantor.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>SPBU</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Shift</TableHead>
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
                    {/* Data yang ditampilkan diubah ke aktifitasOffice */}
                    <TableCell>
                      {c.aktifitasOffice.replace(/_/g, " ")}
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
              Tambah Checklist Kantor
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
              Edit Checklist Kantor
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

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

interface Nozzle {
  id: number;
  kodeNozzle: string;
  tank?: {
    fuel_type: string;
  };
}

interface PumpUnit {
  id: number;
  kodePompa: string;
  nozzle: Nozzle[];
  createdAt: string;
  updatedAt: string;
}

export default function PumpUnitsPage() {
  const [pumpUnits, setPumpUnits] = useState<PumpUnit[]>([]);
  const [loading, setLoading] = useState(true);

  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editing, setEditing] = useState<PumpUnit | null>(null);

  const [form, setForm] = useState<any>({ kodePompa: "" });

  const setField = (key: string, value: any) =>
    setForm((prev: any) => ({ ...prev, [key]: value }));

  const fetchPumpUnits = async () => {
    setLoading(true);
    try {
      const res = await API.get("/supervisor/pump-units");
      setPumpUnits(res.data.data || []);
    } catch (err: any) {
      Swal.fire("Error", "Gagal memuat data pump units!", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPumpUnits();
  }, []);

  const resetForm = () => setForm({ kodePompa: "" });

  const openAdd = () => {
    resetForm();
    setOpenAddModal(true);
  };

  const openEdit = (p: PumpUnit) => {
    setEditing(p);
    setForm({ kodePompa: p.kodePompa });
    setOpenEditModal(true);
  };

  const handleAdd = async () => {
    try {
      await API.post("/supervisor/pump-units", { kodePompa: form.kodePompa });
      Swal.fire("Berhasil", "Pump Unit berhasil ditambahkan!", "success");
      setOpenAddModal(false);
      fetchPumpUnits();
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
      await API.put(`/supervisor/pump-units/${editing.id}`, {
        kodePompa: form.kodePompa,
      });
      Swal.fire("Berhasil", "Pump Unit berhasil diupdate!", "success");
      setOpenEditModal(false);
      setEditing(null);
      fetchPumpUnits();
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
      await API.delete(`/supervisor/pump-units/${id}`);
      Swal.fire("Berhasil", "Data berhasil dihapus!", "success");
      fetchPumpUnits();
    } catch (err: any) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Gagal hapus data!",
        "error"
      );
    }
  };

  const renderFormFields = () => (
    <div>
      <label>Kode Pompa</label>
      <Input
        value={form.kodePompa || ""}
        onChange={(e) => setField("kodePompa", e.target.value)}
        placeholder="Misal: PU-I"
      />
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Pump Units</h1>
        <Button onClick={openAdd}>+ Tambah Data</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data Pump Units</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : pumpUnits.length === 0 ? (
            <p>Belum ada data pump units.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Kode Pompa</TableHead>
                  <TableHead>Nozzle</TableHead>
                  <TableHead>Dibuat</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pumpUnits.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.id}</TableCell>
                    <TableCell>{p.kodePompa}</TableCell>
                    <TableCell>
                      {p.nozzle.length > 0 ? (
                        <ul className="list-disc pl-4">
                          {p.nozzle.map((n) => (
                            <li key={n.id}>
                              {n.kodeNozzle} ({n.tank?.fuel_type || "-"})
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span>-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(p.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEdit(p)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(p.id)}
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
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-semibold mb-4">Tambah Pump Unit</h2>
            {renderFormFields()}
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
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-semibold mb-4">Edit Pump Unit</h2>
            {renderFormFields()}
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

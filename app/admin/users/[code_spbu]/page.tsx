"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  spbu?: {
    code_spbu: string;
  };
}

const spbuOptions = [
  { id: "1", code: "23.345.14" },
  { id: "2", code: "24.347.122" },
  { id: "3", code: "24.345.117" },
  { id: "4", code: "24.345.92" },
];

export default function UsersPage() {
  const { code_spbu } = useParams(); // ambil dari route
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [openAddModal, setOpenAddModal] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [spbuId, setSpbuId] = useState("");
  const [editUser, setEditUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await API.get(`/admin/users?code_spbu=${code_spbu}`);
      setUsers(res.data.data || res.data);
    } catch (err: any) {
      console.error(err.response?.data || err.message);
      if (err.response?.status === 401) {
        Swal.fire({
          icon: "warning",
          title: "Sesi Habis",
          text: "Sesi login habis, silakan login ulang!",
        }).then(() => {
          localStorage.removeItem("token");
          router.push("/");
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (code_spbu) fetchUsers();
  }, [code_spbu]);

  const handleAddUser = async () => {
    if (!name || !email || !password || !role || !spbuId) {
      Swal.fire("Oops!", "Semua field wajib diisi!", "warning");
      return;
    }

    try {
      await API.post("/admin/users", {
        name,
        email,
        password,
        role,
        spbuId,
      });
      Swal.fire("Berhasil", "User berhasil ditambahkan!", "success");
      setName("");
      setEmail("");
      setPassword("");
      setRole("");
      setSpbuId("");
      setOpenAddModal(false);
      fetchUsers();
    } catch (err: any) {
      console.error(err.response?.data || err.message);
      Swal.fire(
        "Error",
        err.response?.data?.message || "Gagal menambahkan user!",
        "error"
      );
    }
  };

  const handleUpdateUser = async () => {
    if (!editUser) return;

    try {
      await API.put(`/admin/users/${editUser.id}`, {
        name: editUser.name,
        email: editUser.email,
      });
      Swal.fire("Berhasil", "User berhasil diupdate!", "success");
      setEditUser(null);
      fetchUsers();
    } catch (err: any) {
      console.error(err.response?.data || err.message);
      Swal.fire(
        "Error",
        err.response?.data?.message || "Gagal update user!",
        "error"
      );
    }
  };

  const handleDeleteUser = async (id: number) => {
    const confirmDelete = await Swal.fire({
      title: "Apakah Anda yakin?",
      text: "User ini akan dihapus permanen.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });

    if (!confirmDelete.isConfirmed) return;

    try {
      await API.delete(`/admin/users/${id}`);
      Swal.fire("Berhasil", "User berhasil dihapus!", "success");
      fetchUsers();
    } catch (err: any) {
      console.error(err.response?.data || err.message);
      Swal.fire(
        "Error",
        err.response?.data?.message || "Gagal menghapus user!",
        "error"
      );
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Users SPBU {code_spbu}</h1>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Daftar User</CardTitle>
          <Button onClick={() => setOpenAddModal(true)}>+ Tambah User</Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading data...</p>
          ) : users.length === 0 ? (
            <p className="text-muted-foreground">Tidak ada user.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Code SPBU</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>{u.id}</TableCell>
                    <TableCell>{u.spbu?.code_spbu || "-"}</TableCell>
                    <TableCell>{u.name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.role}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditUser(u)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteUser(u.id)}
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
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-white/30 z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md space-y-4">
            <h2 className="text-xl font-semibold">Tambah User</h2>

            <Input
              placeholder="Nama"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Select value={role} onValueChange={(val) => setRole(val)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SUPERVISOR">SUPERVISOR</SelectItem>
                <SelectItem value="OPERATOR">OPERATOR</SelectItem>
                <SelectItem value="OB">OB</SelectItem>
                <SelectItem value="SATPAM">SATPAM</SelectItem>
              </SelectContent>
            </Select>

            <Select value={spbuId} onValueChange={(val) => setSpbuId(val)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih SPBU" />
              </SelectTrigger>
              <SelectContent>
                {spbuOptions.map((spbu) => (
                  <SelectItem key={spbu.id} value={spbu.id}>
                    {spbu.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpenAddModal(false)}>
                Batal
              </Button>
              <Button onClick={handleAddUser}>Simpan</Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit */}
      {editUser && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-white/30 z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md space-y-4">
            <h2 className="text-xl font-semibold">Edit User</h2>

            <Input
              placeholder="Nama"
              value={editUser.name}
              onChange={(e) =>
                setEditUser({ ...editUser, name: e.target.value })
              }
            />
            <Input
              placeholder="Email"
              type="email"
              value={editUser.email}
              onChange={(e) =>
                setEditUser({ ...editUser, email: e.target.value })
              }
            />

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditUser(null)}>
                Batal
              </Button>
              <Button onClick={handleUpdateUser}>Simpan</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

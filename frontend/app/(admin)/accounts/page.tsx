"use client";

import { useState, useEffect } from "react";
import { adminApi } from "@/lib/api";
import { UserX, UserCheck, Shield, ShieldOff } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [roles, setRoles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [usersRes, rolesRes] = await Promise.all([
                adminApi.getUsers(),
                adminApi.getRoles()
            ]);
            setUsers(usersRes.data);
            setRoles(rolesRes.data);
        } catch (error) {
            toast.error("Không thể tải danh sách tài khoản");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleToggleStatus = async (id: number, currentStatus: number) => {
        const newStatus = currentStatus === 1 ? 0 : 1;
        const actionStr = currentStatus === 1 ? "khóa (ban)" : "mở khóa";
        if (!window.confirm(`Bạn có chắc chắn muốn ${actionStr} tài khoản này?`)) return;

        try {
            await adminApi.updateUserStatus(id, newStatus);
            toast.success(`Đã ${actionStr} tài khoản`);
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || `Lỗi khi ${actionStr} tài khoản`);
        }
    };

    const handleRoleChange = async (id: number, currentRoleId: number, newRoleId: number) => {
        if (currentRoleId === newRoleId) return;
        const roleStr = roles.find(r => r.id === newRoleId)?.tenQuyen || "";
        if (!window.confirm(`Bạn có chắc muốn đổi quyền tài khoản này thành ${roleStr}?`)) return;

        try {
            await adminApi.updateUserRole(id, newRoleId);
            toast.success("Thay đổi quyền thành công");
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi thay đổi quyền");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý Tài khoản</h1>
                    <p className="text-sm text-gray-500 mt-1">Quản lý người dùng, phân quyền và khóa tài khoản vi phạm</p>
                </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm focus:outline-none">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Mã Số</th>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Thông tin</th>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Phân Quyền</th>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng Thái</th>
                                <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-gray-500">
                                        Đang tải dữ liệu...
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-gray-500">
                                        Không có tài khoản nào.
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="hover:bg-blue-50/50">
                                        <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">#{user.id}</td>
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-gray-900">{user.ten || "Người dúng mới"}</p>
                                            <p className="text-xs text-gray-500">{user.email}</p>
                                            <p className="text-xs text-gray-400">{user.soDienThoai}</p>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <select
                                                value={user.quyen?.id || ""}
                                                onChange={(e) => handleRoleChange(user.id, user.quyen?.id, parseInt(e.target.value))}
                                                className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 cursor-pointer"
                                            >
                                                {roles.map(r => (
                                                    <option key={r.id} value={r.id}>{r.tenQuyen}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            {user.trangThai === 1 ? (
                                                <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">Hoạt động</span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">Bị Khóa (Ban)</span>
                                            )}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleToggleStatus(user.id, user.trangThai)}
                                                className={`p-2 rounded-lg transition-colors cursor-pointer mr-2 ${user.trangThai === 1 ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                                                title={user.trangThai === 1 ? "Khóa tài khoản (Ban)" : "Kích hoạt lại"}
                                            >
                                                {user.trangThai === 1 ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                                            </button>
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

import { useState } from "react";
import Button from "../common/Button";
import { banUser, unbanUser, setUserRole } from "../../api/admin.api";
import { useAuth } from "../../hooks/useAuth";

export default function UserManagementTable({ users, onChange }) {
  const { user: currentUser } = useAuth();
  const [busyId, setBusyId] = useState(null);

  const handleBan = async (userId) => {
    setBusyId(userId);
    await banUser(userId, "Violation of community guidelines");
    onChange();
    setBusyId(null);
  };

  const handleUnban = async (userId) => {
    setBusyId(userId);
    await unbanUser(userId);
    onChange();
    setBusyId(null);
  };

  const handleRoleChange = async (userId, role) => {
    setBusyId(userId);
    await setUserRole(userId, role);
    onChange();
    setBusyId(null);
  };

  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-slate-500 text-left">
          <tr>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Role</th>
            <th className="px-4 py-2">Reputation</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t border-slate-100">
              <td className="px-4 py-2">{u.name}</td>
              <td className="px-4 py-2 text-slate-500">{u.email}</td>
              <td className="px-4 py-2">
                {isSuperAdmin ? (
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    disabled={busyId === u.id}
                    className="border border-slate-200 rounded-md px-2 py-1 text-xs"
                  >
                    <option value="STUDENT">STUDENT</option>
                    <option value="STUDENT_ADMIN">STUDENT_ADMIN</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                  </select>
                ) : (
                  u.role
                )}
              </td>
              <td className="px-4 py-2">{u.reputation}</td>
              <td className="px-4 py-2">
                {u.isBanned ? (
                  <span className="text-red-600 text-xs">Banned</span>
                ) : (
                  <span className="text-emerald-600 text-xs">Active</span>
                )}
              </td>
              <td className="px-4 py-2">
                {u.isBanned ? (
                  <Button variant="secondary" className="text-xs px-2 py-1" disabled={busyId === u.id} onClick={() => handleUnban(u.id)}>
                    Unban
                  </Button>
                ) : (
                  <Button variant="danger" className="text-xs px-2 py-1" disabled={busyId === u.id} onClick={() => handleBan(u.id)}>
                    Ban
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import { useEffect, useState } from "react";
import Loader from "../components/common/Loader";
import UserManagementTable from "../components/admin/UserManagementTable";
import AuditLogTable from "../components/admin/AuditLogTable";
import { fetchUsers, fetchAuditLogs } from "../api/admin.api";

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("users");

  const loadData = () => {
    Promise.all([fetchUsers(), fetchAuditLogs()]).then(([u, l]) => {
      setUsers(u.users);
      setLogs(l.logs);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <Loader label="Loading admin dashboard..." />;

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Admin Dashboard</h1>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab("users")}
          className={`text-sm px-3 py-1.5 rounded-md ${tab === "users" ? "bg-indigo-600 text-white" : "bg-white border border-slate-200"}`}
        >
          Users ({users.length})
        </button>
        <button
          onClick={() => setTab("logs")}
          className={`text-sm px-3 py-1.5 rounded-md ${tab === "logs" ? "bg-indigo-600 text-white" : "bg-white border border-slate-200"}`}
        >
          Audit Log ({logs.length})
        </button>
      </div>

      {tab === "users" ? (
        <UserManagementTable users={users} onChange={loadData} />
      ) : (
        <AuditLogTable logs={logs} />
      )}
    </div>
  );
}

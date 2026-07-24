import { timeAgo } from "../../utils/format";

export default function AuditLogTable({ logs }) {
  if (!logs.length) return <p className="text-sm text-slate-400">No admin actions logged yet.</p>;

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-slate-500 text-left">
          <tr>
            <th className="px-4 py-2">Admin</th>
            <th className="px-4 py-2">Action</th>
            <th className="px-4 py-2">Target</th>
            <th className="px-4 py-2">Reason</th>
            <th className="px-4 py-2">When</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id} className="border-t border-slate-100">
              <td className="px-4 py-2">{log.admin?.name}</td>
              <td className="px-4 py-2">{log.actionType}</td>
              <td className="px-4 py-2 text-slate-500">{log.targetType} · {log.targetId.slice(0, 8)}</td>
              <td className="px-4 py-2 text-slate-500">{log.reason || "—"}</td>
              <td className="px-4 py-2 text-slate-400">{timeAgo(log.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

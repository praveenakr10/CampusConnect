export default function CoordinatorFields({ coordinators, setCoordinators }) {
  const update = (i, key, value) => {
    const next = [...coordinators];
    next[i] = { ...next[i], [key]: value };
    setCoordinators(next);
  };

  const add = () => setCoordinators([...coordinators, { name: "", contact: "" }]);
  const remove = (i) => setCoordinators(coordinators.filter((_, idx) => idx !== i));

  return (
    <div>
      <label className="block text-sm font-medium mb-1">Coordinators</label>
      <div className="space-y-2">
        {coordinators.map((c, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={c.name}
              onChange={(e) => update(i, "name", e.target.value)}
              placeholder="Name"
              className="flex-1 border border-slate-300 rounded-md px-3 py-2 text-sm"
            />
            <input
              value={c.contact}
              onChange={(e) => update(i, "contact", e.target.value)}
              placeholder="Phone / email (optional)"
              className="flex-1 border border-slate-300 rounded-md px-3 py-2 text-sm"
            />
            {coordinators.length > 1 && (
              <button type="button" onClick={() => remove(i)} className="text-slate-400 hover:text-red-600 px-2">
                &times;
              </button>
            )}
          </div>
        ))}
      </div>
      <button type="button" onClick={add} className="text-indigo-600 text-xs mt-2 hover:underline">
        + Add coordinator
      </button>
    </div>
  );
}

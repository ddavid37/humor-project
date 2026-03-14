"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function cellVal(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "boolean") return v ? "true" : "false";
  return String(v);
}

export function FlavorDetail({
  flavor,
  steps,
  updateFlavorColumns,
  insertStepColumns,
}: {
  flavor: Record<string, unknown>;
  steps: Record<string, unknown>[];
  updateFlavorColumns: string[];
  insertStepColumns: string[];
}) {
  const router = useRouter();
  const [editingFlavor, setEditingFlavor] = useState(false);
  const [flavorVals, setFlavorVals] = useState(
    updateFlavorColumns.reduce(
      (acc, c) => {
        acc[c] = cellVal(flavor[c]);
        return acc;
      },
      {} as Record<string, string>
    )
  );
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [stepVals, setStepVals] = useState<Record<string, string>>({});
  const [showAddStep, setShowAddStep] = useState(false);
  const [addStepVals, setAddStepVals] = useState<Record<string, string>>({
    humor_flavor_id: String(flavor.id),
    order_by: String(steps.length),
  });

  const flavorId = String(flavor.id);

  const saveFlavor = async () => {
    const res = await fetch(`/api/flavors/${flavorId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(flavorVals),
    });
    if (res.ok) {
      setEditingFlavor(false);
      router.refresh();
    }
  };

  const deleteFlavor = async () => {
    if (!confirm("Delete this flavor and all its steps?")) return;
    const res = await fetch(`/api/flavors/${flavorId}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/flavors");
      router.refresh();
    }
  };

  const startEditStep = (step: Record<string, unknown>) => {
    setEditingStepId(String(step.id));
    setStepVals(
      insertStepColumns.reduce(
        (acc, c) => {
          acc[c] = cellVal(step[c]);
          return acc;
        },
        {} as Record<string, string>
      )
    );
  };

  const saveStep = async () => {
    if (!editingStepId) return;
    const res = await fetch(`/api/steps/${editingStepId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(stepVals),
    });
    if (res.ok) {
      setEditingStepId(null);
      router.refresh();
    }
  };

  const deleteStep = async (stepId: string) => {
    if (!confirm("Delete this step?")) return;
    const res = await fetch(`/api/steps/${stepId}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  };

  const moveStep = async (index: number, direction: "up" | "down") => {
    const step = steps[index] as Record<string, unknown>;
    const other = steps[direction === "up" ? index - 1 : index + 1] as Record<string, unknown> | undefined;
    if (!other || step.order_by == null) return;
    const stepOrder = Number(step.order_by);
    const otherOrder = Number(other.order_by);
    await fetch(`/api/steps/${step.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_by: otherOrder }),
    });
    await fetch(`/api/steps/${other.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_by: stepOrder }),
    });
    router.refresh();
  };

  const submitAddStep = async () => {
    const body = { ...addStepVals, humor_flavor_id: flavorId };
    if (body.order_by === "" && steps.length > 0) {
      const maxOrder = Math.max(
        ...steps.map((s) => Number((s as Record<string, unknown>).order_by) ?? 0)
      );
      body.order_by = String(maxOrder + 1);
    }
    const res = await fetch("/api/steps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setShowAddStep(false);
      setAddStepVals({ humor_flavor_id: flavorId, order_by: String(steps.length + 1) });
      router.refresh();
    }
  };

  const nameKey = Object.keys(flavor).find(
    (k) => k.toLowerCase().includes("name") || k.toLowerCase().includes("title")
  );

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <h1 className="text-2xl font-bold">
          {nameKey ? String(flavor[nameKey] ?? flavor.id) : String(flavor.id)}
        </h1>
        <p className="mt-1 font-mono text-xs text-slate-500">{flavorId}</p>

        {editingFlavor ? (
          <div className="mt-4 space-y-2">
            {updateFlavorColumns.map((c) => (
              <div key={c}>
                <label className="block text-sm text-slate-600 dark:text-slate-400">
                  {c}
                </label>
                <input
                  value={flavorVals[c] ?? ""}
                  onChange={(e) =>
                    setFlavorVals((v) => ({ ...v, [c]: e.target.value }))
                  }
                  className="mt-1 w-full rounded border border-slate-300 bg-white px-2 py-1 dark:border-slate-600 dark:bg-slate-800"
                />
              </div>
            ))}
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={saveFlavor}
                className="rounded bg-amber-600 px-3 py-1 text-white"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setEditingFlavor(false)}
                className="rounded border border-slate-300 px-3 py-1 dark:border-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={deleteFlavor}
                className="rounded border border-red-300 px-3 py-1 text-red-600 dark:border-red-700"
              >
                Delete flavor
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => setEditingFlavor(true)}
              className="rounded bg-amber-600 px-3 py-1 text-white"
            >
              Edit flavor
            </button>
          </div>
        )}
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Steps</h2>
          <button
            type="button"
            onClick={() => setShowAddStep(true)}
            className="rounded bg-slate-200 px-3 py-1 text-sm dark:bg-slate-700"
          >
            Add step
          </button>
        </div>

        {showAddStep && (
          <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
            <h3 className="text-sm font-medium">New step</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {insertStepColumns.map((c) => (
                <input
                  key={c}
                  placeholder={c}
                  value={addStepVals[c] ?? ""}
                  onChange={(e) =>
                    setAddStepVals((v) => ({ ...v, [c]: e.target.value }))
                  }
                  className="rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800"
                />
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={submitAddStep}
                className="rounded bg-green-600 px-3 py-1 text-white text-sm"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setShowAddStep(false)}
                className="rounded border px-3 py-1 text-sm dark:border-slate-600"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <ul className="space-y-2">
          {steps.map((step, index) => {
            const sid = String((step as Record<string, unknown>).id);
            const isEditing = editingStepId === sid;
            return (
              <li
                key={sid}
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800"
              >
                <span className="w-8 text-slate-500">{index + 1}.</span>
                {isEditing ? (
                  <>
                    <div className="flex flex-1 flex-wrap gap-2">
                      {insertStepColumns.map((c) => (
                        <input
                          key={c}
                          placeholder={c}
                          value={stepVals[c] ?? ""}
                          onChange={(e) =>
                            setStepVals((v) => ({ ...v, [c]: e.target.value }))
                          }
                          className="min-w-[120px] rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800"
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={saveStep}
                      className="rounded bg-green-600 px-2 py-1 text-white text-sm"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingStepId(null)}
                      className="rounded border px-2 py-1 text-sm"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex-1 truncate text-sm">
                      {insertStepColumns
                        .map((c) => `${c}: ${cellVal((step as Record<string, unknown>)[c])}`)
                        .join(" · ")}
                    </div>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => moveStep(index, "up")}
                        disabled={index === 0}
                        className="rounded border px-2 py-0.5 text-xs disabled:opacity-40"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveStep(index, "down")}
                        disabled={index === steps.length - 1}
                        className="rounded border px-2 py-0.5 text-xs disabled:opacity-40"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => startEditStep(step as Record<string, unknown>)}
                        className="rounded bg-amber-600 px-2 py-0.5 text-white text-xs"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteStep(sid)}
                        className="rounded bg-red-600 px-2 py-0.5 text-white text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </li>
            );
          })}
        </ul>
        {steps.length === 0 && !showAddStep && (
          <p className="text-slate-500">No steps. Add one to build the chain.</p>
        )}
      </div>
    </div>
  );
}

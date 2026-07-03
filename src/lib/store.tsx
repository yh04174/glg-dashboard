"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Entity, TitleMapping, OrgUnit, Employee } from "./types";
import { sampleEntities, sampleTitleMappings, sampleOrgUnits, sampleEmployees } from "./sampleData";
import { createClient } from "@/lib/supabase/client";
import type { AppUser } from "./auth";

interface StoreState {
  entities: Entity[];
  titleMappings: TitleMapping[];
  orgUnits: OrgUnit[];
  employees: Employee[];
}

export interface Checkpoint {
  id: string;
  label: string;
  savedAt: string; // ISO timestamp
  state: StoreState;
}

interface StoreApi extends StoreState {
  loading: boolean;
  canEdit: boolean;

  addEntity: (e: Entity) => void;
  updateEntity: (e: Entity) => void;
  removeEntity: (id: string) => void;

  setTitle: (entityId: string, glg: number, title: string) => void;

  addOrgUnit: (u: OrgUnit) => void;
  updateOrgUnit: (u: OrgUnit) => void;
  removeOrgUnit: (id: string) => void;
  countDescendants: (id: string) => number;

  addEmployee: (e: Employee) => void;
  updateEmployee: (e: Employee) => void;
  removeEmployee: (id: string) => void;

  resetToSample: () => void;

  canUndo: boolean;
  undo: () => void;

  checkpoints: Checkpoint[];
  saveCheckpoint: (label: string) => void;
  restoreCheckpoint: (id: string) => void;
  deleteCheckpoint: (id: string) => void;
}

const ROW_ID = "main";
const MAX_HISTORY = 30;

const StoreContext = createContext<StoreApi | null>(null);

const sampleState: StoreState = {
  entities: sampleEntities,
  titleMappings: sampleTitleMappings,
  orgUnits: sampleOrgUnits,
  employees: sampleEmployees,
};

const emptyState: StoreState = { entities: [], titleMappings: [], orgUnits: [], employees: [] };

// id와 그 하위 모든 조직(자식, 손자, ...)의 id를 재귀적으로 모두 수집
function collectSubtreeIds(units: OrgUnit[], rootId: string): Set<string> {
  const ids = new Set<string>([rootId]);
  let added = true;
  while (added) {
    added = false;
    for (const u of units) {
      if (u.parentId && ids.has(u.parentId) && !ids.has(u.id)) {
        ids.add(u.id);
        added = true;
      }
    }
  }
  return ids;
}

export function StoreProvider({ user, children }: { user: AppUser; children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const editable = user.role === "editor" || user.role === "admin";

  const [state, setState] = useState<StoreState>(emptyState);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<StoreState[]>([]);
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: row } = await supabase
        .from("org_state")
        .select("data")
        .eq("id", ROW_ID)
        .maybeSingle();

      if (cancelled) return;

      if (row?.data) {
        setState(row.data as StoreState);
      } else {
        // 최초 실행: 샘플 데이터로 시드
        await supabase
          .from("org_state")
          .upsert({ id: ROW_ID, data: sampleState, updated_by: user.email });
        setState(sampleState);
      }

      const { data: chkRows } = await supabase
        .from("org_checkpoints")
        .select("id, label, saved_at, data")
        .order("saved_at", { ascending: true });

      if (!cancelled) {
        setCheckpoints(
          (chkRows ?? []).map((c) => ({ id: c.id, label: c.label, savedAt: c.saved_at, state: c.data as StoreState }))
        );
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [supabase, user.email]);

  const persist = useCallback(
    (next: StoreState) => {
      supabase
        .from("org_state")
        .upsert({ id: ROW_ID, data: next, updated_at: new Date().toISOString(), updated_by: user.email })
        .then();
    },
    [supabase, user.email]
  );

  // 변경 직전 상태를 undo 스택에 남기고 state를 갱신 + 서버에 저장
  const mutate = (updater: (s: StoreState) => StoreState) => {
    if (!editable) return;
    const next = updater(state);
    setHistory((h) => [...h.slice(-(MAX_HISTORY - 1)), state]);
    setState(next);
    persist(next);
  };

  const api: StoreApi = {
    ...state,
    loading,
    canEdit: editable,

    addEntity: (e) => mutate((s) => ({ ...s, entities: [...s.entities, e] })),
    updateEntity: (e) =>
      mutate((s) => ({ ...s, entities: s.entities.map((x) => (x.id === e.id ? e : x)) })),
    removeEntity: (id) =>
      mutate((s) => ({
        ...s,
        entities: s.entities.filter((x) => x.id !== id),
        titleMappings: s.titleMappings.filter((x) => x.entityId !== id),
        orgUnits: s.orgUnits.filter((x) => x.entityId !== id),
      })),

    setTitle: (entityId, glg, title) =>
      mutate((s) => {
        const exists = s.titleMappings.some((m) => m.entityId === entityId && m.glg === glg);
        const titleMappings = exists
          ? s.titleMappings.map((m) =>
              m.entityId === entityId && m.glg === glg ? { ...m, title } : m
            )
          : [...s.titleMappings, { entityId, glg, title }];
        return { ...s, titleMappings };
      }),

    addOrgUnit: (u) => mutate((s) => ({ ...s, orgUnits: [...s.orgUnits, u] })),
    updateOrgUnit: (u) =>
      mutate((s) => ({ ...s, orgUnits: s.orgUnits.map((x) => (x.id === u.id ? u : x)) })),
    removeOrgUnit: (id) =>
      mutate((s) => {
        const doomed = collectSubtreeIds(s.orgUnits, id);
        return {
          ...s,
          orgUnits: s.orgUnits.filter((x) => !doomed.has(x.id)),
          employees: s.employees.filter((x) => !doomed.has(x.orgUnitId)),
        };
      }),
    countDescendants: (id) => collectSubtreeIds(state.orgUnits, id).size - 1,

    addEmployee: (e) => mutate((s) => ({ ...s, employees: [...s.employees, e] })),
    updateEmployee: (e) =>
      mutate((s) => ({ ...s, employees: s.employees.map((x) => (x.id === e.id ? e : x)) })),
    removeEmployee: (id) =>
      mutate((s) => ({ ...s, employees: s.employees.filter((x) => x.id !== id) })),

    resetToSample: () => mutate(() => sampleState),

    canUndo: editable && history.length > 0,
    undo: () => {
      if (!editable || history.length === 0) return;
      const prev = history[history.length - 1];
      setHistory((h) => h.slice(0, -1));
      setState(prev);
      persist(prev);
    },

    checkpoints,
    saveCheckpoint: (label) => {
      if (!editable) return;
      const id = `chk-${Date.now()}`;
      const savedAt = new Date().toISOString();
      const chk: Checkpoint = { id, label: label || "이름 없는 저장", savedAt, state };
      setCheckpoints((cs) => [...cs, chk]);
      supabase
        .from("org_checkpoints")
        .insert({ id, label: chk.label, saved_at: savedAt, saved_by: user.email, data: state })
        .then();
    },
    restoreCheckpoint: (id) => {
      const chk = checkpoints.find((c) => c.id === id);
      if (!chk) return;
      mutate(() => chk.state);
    },
    deleteCheckpoint: (id) => {
      if (!editable) return;
      setCheckpoints((cs) => cs.filter((c) => c.id !== id));
      supabase.from("org_checkpoints").delete().eq("id", id).then();
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#0B1F3A]/40">
        불러오는 중...
      </div>
    );
  }

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

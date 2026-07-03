"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Entity, TitleMapping, OrgUnit, Employee } from "./types";
import { sampleEntities, sampleTitleMappings, sampleOrgUnits, sampleEmployees } from "./sampleData";

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

const STORAGE_KEY = "glg-dashboard-state-v1";
const CHECKPOINTS_KEY = "glg-dashboard-checkpoints-v1";
const MAX_HISTORY = 30;

const StoreContext = createContext<StoreApi | null>(null);

const sampleState: StoreState = {
  entities: sampleEntities,
  titleMappings: sampleTitleMappings,
  orgUnits: sampleOrgUnits,
  employees: sampleEmployees,
};

function loadInitial(): StoreState {
  if (typeof window === "undefined") return sampleState;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore parse errors, fall back to sample data
  }
  return sampleState;
}

function loadCheckpoints(): Checkpoint[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CHECKPOINTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore parse errors
  }
  return [];
}

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

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<StoreState>(() => loadInitial());
  const [history, setHistory] = useState<StoreState[]>([]);
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>(() => loadCheckpoints());

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    window.localStorage.setItem(CHECKPOINTS_KEY, JSON.stringify(checkpoints));
  }, [checkpoints]);

  // 변경 직전 상태를 undo 스택에 남기고 state를 갱신
  const mutate = (updater: (s: StoreState) => StoreState) => {
    setHistory((h) => [...h.slice(-(MAX_HISTORY - 1)), state]);
    setState(updater);
  };

  const api: StoreApi = {
    ...state,

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

    canUndo: history.length > 0,
    undo: () => {
      if (history.length === 0) return;
      const prev = history[history.length - 1];
      setHistory((h) => h.slice(0, -1));
      setState(prev);
    },

    checkpoints,
    saveCheckpoint: (label) =>
      setCheckpoints((cs) => [
        ...cs,
        { id: `chk-${Date.now()}`, label: label || "이름 없는 저장", savedAt: new Date().toISOString(), state },
      ]),
    restoreCheckpoint: (id) => {
      const chk = checkpoints.find((c) => c.id === id);
      if (!chk) return;
      mutate(() => chk.state);
    },
    deleteCheckpoint: (id) => setCheckpoints((cs) => cs.filter((c) => c.id !== id)),
  };

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

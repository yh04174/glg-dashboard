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

interface StoreApi extends StoreState {
  addEntity: (e: Entity) => void;
  updateEntity: (e: Entity) => void;
  removeEntity: (id: string) => void;

  setTitle: (entityId: string, glg: number, title: string) => void;

  addOrgUnit: (u: OrgUnit) => void;
  updateOrgUnit: (u: OrgUnit) => void;
  removeOrgUnit: (id: string) => void;

  addEmployee: (e: Employee) => void;
  updateEmployee: (e: Employee) => void;
  removeEmployee: (id: string) => void;

  resetToSample: () => void;
}

const STORAGE_KEY = "glg-dashboard-state-v1";

const StoreContext = createContext<StoreApi | null>(null);

function loadInitial(): StoreState {
  if (typeof window === "undefined") {
    return {
      entities: sampleEntities,
      titleMappings: sampleTitleMappings,
      orgUnits: sampleOrgUnits,
      employees: sampleEmployees,
    };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore parse errors, fall back to sample data
  }
  return {
    entities: sampleEntities,
    titleMappings: sampleTitleMappings,
    orgUnits: sampleOrgUnits,
    employees: sampleEmployees,
  };
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<StoreState>(() => loadInitial());

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const api: StoreApi = {
    ...state,

    addEntity: (e) => setState((s) => ({ ...s, entities: [...s.entities, e] })),
    updateEntity: (e) =>
      setState((s) => ({ ...s, entities: s.entities.map((x) => (x.id === e.id ? e : x)) })),
    removeEntity: (id) =>
      setState((s) => ({
        ...s,
        entities: s.entities.filter((x) => x.id !== id),
        titleMappings: s.titleMappings.filter((x) => x.entityId !== id),
        orgUnits: s.orgUnits.filter((x) => x.entityId !== id),
      })),

    setTitle: (entityId, glg, title) =>
      setState((s) => {
        const exists = s.titleMappings.some((m) => m.entityId === entityId && m.glg === glg);
        const titleMappings = exists
          ? s.titleMappings.map((m) =>
              m.entityId === entityId && m.glg === glg ? { ...m, title } : m
            )
          : [...s.titleMappings, { entityId, glg, title }];
        return { ...s, titleMappings };
      }),

    addOrgUnit: (u) => setState((s) => ({ ...s, orgUnits: [...s.orgUnits, u] })),
    updateOrgUnit: (u) =>
      setState((s) => ({ ...s, orgUnits: s.orgUnits.map((x) => (x.id === u.id ? u : x)) })),
    removeOrgUnit: (id) =>
      setState((s) => ({
        ...s,
        orgUnits: s.orgUnits.filter((x) => x.id !== id && x.parentId !== id),
        employees: s.employees.filter((x) => x.orgUnitId !== id),
      })),

    addEmployee: (e) => setState((s) => ({ ...s, employees: [...s.employees, e] })),
    updateEmployee: (e) =>
      setState((s) => ({ ...s, employees: s.employees.map((x) => (x.id === e.id ? e : x)) })),
    removeEmployee: (id) =>
      setState((s) => ({ ...s, employees: s.employees.filter((x) => x.id !== id) })),

    resetToSample: () =>
      setState({
        entities: sampleEntities,
        titleMappings: sampleTitleMappings,
        orgUnits: sampleOrgUnits,
        employees: sampleEmployees,
      }),
  };

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

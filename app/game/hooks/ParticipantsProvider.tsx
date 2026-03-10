"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from "react";
import { Participant } from "../components/ParticipantList";

const STORAGE_KEY = "obap-participants";

export interface ParticipantsContextValue {
  participants: Participant[];
  globalMultiplier: number;
  setParticipants: (updater: Participant[] | ((prev: Participant[]) => Participant[])) => void;
  handleAdd: (name: string) => void;
  handleRemove: (id: string) => void;
  handleChangeMultiplier: (id: string, delta: number) => void;
  handleGlobalMultiplierChange: (delta: number) => void;
  handleGlobalMultiplierInput: (value: number) => void;
}

export const ParticipantsContext = createContext<ParticipantsContextValue | null>(null);

function loadFromStorage(): { participants: Participant[]; globalMultiplier: number } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { participants: [], globalMultiplier: 1 };
    return JSON.parse(raw);
  } catch {
    return { participants: [], globalMultiplier: 1 };
  }
}

function saveToStorage(participants: Participant[], globalMultiplier: number) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ participants, globalMultiplier }));
  } catch {
    // ignore
  }
}

export function ParticipantsProvider({ children }: { children: ReactNode }) {
  const [participants, setParticipantsRaw] = useState<Participant[]>([]);
  const [globalMultiplier, setGlobalMultiplierRaw] = useState(1);
  const participantsRef = useRef<Participant[]>([]);
  const globalMultiplierRef = useRef(1);

  useEffect(() => {
    const stored = loadFromStorage();
    participantsRef.current = stored.participants;
    globalMultiplierRef.current = stored.globalMultiplier;
    setParticipantsRaw(stored.participants);
    setGlobalMultiplierRaw(stored.globalMultiplier);
  }, []);

  const setParticipants = useCallback(
    (updater: Participant[] | ((prev: Participant[]) => Participant[])) => {
      setParticipantsRaw((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        participantsRef.current = next;
        saveToStorage(next, globalMultiplierRef.current);
        return next;
      });
    },
    []
  );

  const setGlobalMultiplier = useCallback((updater: number | ((prev: number) => number)) => {
    setGlobalMultiplierRaw((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      globalMultiplierRef.current = next;
      saveToStorage(participantsRef.current, next);
      return next;
    });
  }, []);

  const handleAdd = useCallback(
    (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      setParticipants((prev) => [
        ...prev,
        { id: Date.now().toString(), name: trimmed, multiplier: globalMultiplierRef.current },
      ]);
    },
    [setParticipants]
  );

  const handleRemove = useCallback(
    (id: string) => {
      setParticipants((prev) => prev.filter((p) => p.id !== id));
    },
    [setParticipants]
  );

  const handleChangeMultiplier = useCallback(
    (id: string, delta: number) => {
      setParticipants((prev) =>
        prev.map((p) => (p.id === id ? { ...p, multiplier: Math.max(1, p.multiplier + delta) } : p))
      );
    },
    [setParticipants]
  );

  const handleGlobalMultiplierChange = useCallback(
    (delta: number) => {
      const next = Math.min(1000, Math.max(1, globalMultiplierRef.current + delta));
      setGlobalMultiplier(next);
      setParticipants((parts) => parts.map((p) => ({ ...p, multiplier: next })));
    },
    [setGlobalMultiplier, setParticipants]
  );

  const handleGlobalMultiplierInput = useCallback(
    (value: number) => {
      setGlobalMultiplier(value);
      setParticipants((parts) => parts.map((p) => ({ ...p, multiplier: value })));
    },
    [setGlobalMultiplier, setParticipants]
  );

  return (
    <ParticipantsContext.Provider
      value={{
        participants,
        globalMultiplier,
        setParticipants,
        handleAdd,
        handleRemove,
        handleChangeMultiplier,
        handleGlobalMultiplierChange,
        handleGlobalMultiplierInput,
      }}
    >
      {children}
    </ParticipantsContext.Provider>
  );
}

export function useSharedParticipants(): ParticipantsContextValue {
  const ctx = useContext(ParticipantsContext);
  if (!ctx) throw new Error("useSharedParticipants must be used within ParticipantsProvider");
  return ctx;
}

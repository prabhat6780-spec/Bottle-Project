/**
 * useCoatingOperators
 *
 * Merges API operators (role = 'operator') with any custom names
 * the user has typed manually and saved to localStorage.
 *
 * Usage:
 *   const { operatorOptions, saveCustomOperator } = useCoatingOperators(users);
 *
 *   operatorOptions  — array of strings (names) for the <select>
 *   saveCustomOperator(name) — persists a new name to localStorage
 */

import { useMemo } from 'react';

const LS_KEY = 'coatingCustomOperators';

export function getCustomOperators() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY)) || [];
  } catch {
    return [];
  }
}

export function saveCustomOperator(name) {
  const trimmed = name?.trim();
  if (!trimmed) return;
  const existing = getCustomOperators();
  if (!existing.includes(trimmed)) {
    localStorage.setItem(LS_KEY, JSON.stringify([...existing, trimmed]));
  }
}

export function useCoatingOperators(users = []) {
  const apiOperatorNames = useMemo(() =>
    users
      .filter(u => (typeof u.role === 'object' ? u.role?.name : u.role)?.toLowerCase() === 'operator')
      .map(u => u.name)
      .filter(Boolean),
    [users]
  );

  // Merge API names + localStorage custom names (deduplicated)
  const operatorOptions = useMemo(() => {
    const custom = getCustomOperators();
    const all = [...new Set([...apiOperatorNames, ...custom])];
    return all.sort((a, b) => a.localeCompare(b));
  }, [apiOperatorNames]);

  return { operatorOptions, saveCustomOperator };
}

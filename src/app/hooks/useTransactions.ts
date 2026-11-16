"use client";
import { useMemo, useOptimistic, useReducer } from "react";
import { filtersReducer, initialFilters } from "@/lib/filters";
import { useRealtimeTransactions } from "./useRealtimeTransactions";
import type { Transaction } from "../dashboard/types";

export function useTransactions(transactions_list: Transaction[]) {
  // Server list + live updates from Supabase Realtime
  const realtimeTransactions = useRealtimeTransactions(transactions_list);

  // Pending inserts shown instantly, dropped once the action settles
  const [optimisticTransactions, addOptimistic] = useOptimistic(
    realtimeTransactions,
    (state, newTx: Transaction) => [newTx, ...state],
  );

  const [filters, dispatch] = useReducer(filtersReducer, initialFilters);

  // Derived state: recomputed only when the list or the filters change.
  // Dates are "YYYY-MM-DD" strings, so string comparison sorts chronologically.
  const transactions = useMemo(
    () =>
      optimisticTransactions.filter((t) => {
        if (filters.type === "income" && t.amount <= 0) return false;
        if (filters.type === "expense" && t.amount >= 0) return false;
        if (filters.categoryId && t.category_id !== filters.categoryId)
          return false;
        if (filters.from && t.date < filters.from) return false;
        if (filters.to && t.date > filters.to) return false;
        if (
          filters.search &&
          !t.description?.toLowerCase().includes(filters.search.toLowerCase())
        )
          return false;
        return true;
      }),
    [optimisticTransactions, filters],
  );

  const balance = transactions.reduce((sum, t) => sum + t.amount, 0);

  return {
    transactions, // filtered, ready to render
    balance, // sum of the filtered list, in cents
    filters, // current filter state
    dispatch, // to change filters
    addOptimistic, // for AddTransactionForm
    isEmpty: transactions.length === 0,
  };
}

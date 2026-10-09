"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Transaction } from "./types";

export function useRealtimeTransactions(transactions_list: Transaction[]) {
  const [transactions, setTransactions] = useState(transactions_list);
  const [prevList, setPrevList] = useState(transactions_list);

  // Server props win whenever revalidatePath sends a fresh list.
  // Adjusting state during render avoids the extra pass a useEffect would cause.
  if (transactions_list !== prevList) {
    setPrevList(transactions_list);
    setTransactions(transactions_list);
  }

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("transactions")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "transactions" },
        (payload) => {
          console.log("realtime payload:", payload.new);
          setTransactions((prev) => [payload.new as Transaction, ...prev]);
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "transactions" },
        (payload) => {
          setTransactions((prev) =>
            prev.map((t) =>
              t.id === payload.new.id ? (payload.new as Transaction) : t,
            ),
          );
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "transactions" },
        (payload) => {
          setTransactions((prev) =>
            prev.filter((t) => t.id !== payload.old.id),
          );
        },
      )
      .subscribe((status) => console.log("channel status:", status));

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return transactions;
}

"use client";
import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { deleteTransaction } from "./actions";
import type { Transaction, Category } from "./types";

interface DashboardClientProps {
  transactions_list: Transaction[];
  categories_list: Category[];
}

export function TransactionList({
  transactions_list,
  categories_list,
}: DashboardClientProps) {
  const [transactions, setTransactions] = useState(transactions_list);
  const supabase = createClient();

  useEffect(() => {
    setTransactions(transactions_list);
  }, [transactions_list]);

  useEffect(() => {
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

  const balance = useMemo(
    () => transactions.reduce((sum, t) => sum + t.amount, 0),
    [transactions],
  );

  // Display: divide by 100 for euros
  const euros = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  });
  const formatted = euros.format(balance / 100);

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Balance
        </p>
        <p className="mt-1 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {formatted}
        </p>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Transactions
        </h2>

        {transactions.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No transactions yet.
          </p>
        ) : (
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {transactions.map((transaction) => {
              const icon = categories_list.find(
                (category) => category.id === transaction.category_id,
              )?.icon;

              return (
                <li
                  key={transaction.id}
                  className="flex items-center justify-between gap-4 py-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {transaction.receiptUrl ? (
                      <a
                        href={transaction.receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0"
                      >
                        <img
                          src={transaction.receiptUrl}
                          alt="Receipt"
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                      </a>
                    ) : (
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-lg dark:bg-zinc-800">
                        {icon}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {transaction.category}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {transaction.date}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                      {euros.format(transaction.amount / 100)}
                    </span>
                    <button
                      onClick={() => deleteTransaction(transaction.id)}
                      className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500/30 dark:text-red-400 dark:hover:bg-red-950/40 cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

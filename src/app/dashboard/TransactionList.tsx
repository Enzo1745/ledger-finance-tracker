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
  const formatted = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(balance / 100);

  return (
    <>
      {transactions && (
        <div>
          <p>List of transactions:</p>
          <ul>
            {transactions.map((transaction) => (
              <div key={transaction.id}>
                <li className="inline-block">
                  {
                    categories_list.find(
                      (category) => category.id === transaction.category_id,
                    )?.icon
                  }{" "}
                  {transaction.category}: {"€" + transaction.amount / 100},{" "}
                  {transaction.date}
                </li>
                {transaction.receiptUrl && (
                  <a
                    href={transaction.receiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={transaction.receiptUrl}
                      alt="Image failed to load"
                      className="h-16 w-16 inline-block"
                    />
                  </a>
                )}
                <br />
                <button
                  onClick={() => deleteTransaction(transaction.id)}
                  className="mt-2 inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 focus:ring-offset-white active:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus:ring-zinc-100 dark:focus:ring-offset-zinc-900 cursor-pointer"
                >
                  Delete
                </button>
              </div>
            ))}
          </ul>
          <p>Balance: {formatted}</p>
        </div>
      )}
    </>
  );
}

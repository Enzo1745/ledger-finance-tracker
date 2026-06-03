"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { deleteTransaction } from "./actions";

interface Transaction {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  receiptUrl: string | null;
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

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
      .subscribe((status) => console.log("channel status:", status));

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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
                  {transaction.category}: {"$" + transaction.amount / 100},{" "}
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
        </div>
      )}
    </>
  );
}

"use client";

import { signOut } from "./actions";
import { TransactionList } from "./TransactionList";
import Summary from "./Summary";
import { AddTransactionForm } from "./AddTransactionForm";
import { ChangeNameForm } from "./ChangeNameForm";
import { useRealtimeTransactions } from "./useRealtimeTransactions";
import type { Transaction, Category } from "./types";
import Link from "next/link";
import { useOptimistic } from "react";
import { Suspense } from "react";

interface DashboardClientProps {
  email: string;
  display_name: string | undefined;
  transactions_list: Transaction[];
  balance: number;
  categories_list: Category[];
}

function SummarySkeleton() {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
        Balance
      </p>
      <p className="mt-1 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Loading total balalnce...
      </p>
    </section>
  );
}

function TransactionsSkeleton() {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          style={{
            height: 48,
            background: "var(--color-background-secondary)",
            borderRadius: 8,
            marginBottom: 8,
          }}
        />
      ))}
    </>
  );
}

export default function DashboardClient({
  email,
  display_name,
  transactions_list,
  balance,
  categories_list,
}: DashboardClientProps) {
  const transactions = useRealtimeTransactions(transactions_list);
  const [optimisticTransactions, addOptimistic] = useOptimistic(
    transactions,
    (state, newTx: Transaction) => [newTx, ...state],
  );

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-10 dark:bg-zinc-950">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <header className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {display_name ? `${display_name} · ` : ""}
              {email}
            </p>
          </div>
          <button
            onClick={() => signOut()}
            className="inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-900 shadow-sm transition-colors hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 focus:ring-offset-white active:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800 dark:focus:ring-zinc-100 dark:focus:ring-offset-zinc-900 cursor-pointer"
          >
            Sign out
          </button>
        </header>

        {/* Summary is cached — fast */}
        <Suspense fallback={<SummarySkeleton />}>
          <Summary balance={balance} />
        </Suspense>

        {/* Transaction list — always fresh, may be slower */}
        <Suspense fallback={<TransactionsSkeleton />}>
          <TransactionList
            transactions={optimisticTransactions}
            categories_list={categories_list}
          />
        </Suspense>

        <div className="grid gap-6 md:grid-cols-2">
          <AddTransactionForm
            categories_list={categories_list}
            addOptimistic={addOptimistic}
          />
          <ChangeNameForm />
        </div>
        <Link href="/dashboard">Dashboard</Link>
      </main>
    </div>
  );
}

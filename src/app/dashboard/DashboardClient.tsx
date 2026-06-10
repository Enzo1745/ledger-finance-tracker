"use client";

import { signOut } from "./actions";
import { TransactionList } from "./TransactionList";
import { AddTransactionForm } from "./AddTransactionForm";
import { ChangeNameForm } from "./ChangeNameForm";
import type { Transaction, Category } from "./types";

interface DashboardClientProps {
  email: string;
  display_name: string | undefined;
  transactions_list: Transaction[];
  categories_list: Category[];
}

export default function DashboardClient({
  email,
  display_name,
  transactions_list,
  categories_list,
}: DashboardClientProps) {
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

        <TransactionList
          transactions_list={transactions_list}
          categories_list={categories_list}
        />

        <div className="grid gap-6 md:grid-cols-2">
          <AddTransactionForm categories_list={categories_list} />
          <ChangeNameForm />
        </div>
      </main>
    </div>
  );
}

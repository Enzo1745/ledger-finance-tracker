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
    <>
      <p>{email} is logged in!</p>
      {display_name && <p>Name: {display_name}</p>}

      <TransactionList
        transactions_list={transactions_list}
        categories_list={categories_list}
      />

      <button onClick={() => signOut()} className="hover:cursor-pointer">
        Sign out
      </button>

      <ChangeNameForm />

      <AddTransactionForm categories_list={categories_list} />
    </>
  );
}

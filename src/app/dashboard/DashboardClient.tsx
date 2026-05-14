"use client";
import { signOut, updateName, insertTransaction } from "./actions";

interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
}

interface DashboardClientProps {
  email: string;
  display_name: string | undefined;
  transactions_list: Transaction[];
}

export default function DashboardClient({
  email,
  display_name,
  transactions_list,
}: DashboardClientProps) {
  return (
    <>
      <p>{email} is logged in!</p>
      {display_name && <p>Name: {display_name}</p>}
      {transactions_list && (
        <div>
          <p>List of transactions:</p>
          <ul>
            {transactions_list.map((transaction) => (
              <li key={transaction.id}>
                {transaction.category}: {"$" + transaction.amount / 100},{" "}
                {transaction.date}
              </li>
            ))}
          </ul>
        </div>
      )}
      <button onClick={() => signOut()} className="hover:cursor-pointer">
        Sign out
      </button>
      <form action={updateName}>
        <label
          htmlFor="name"
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Change name:
          <br />
        </label>
        <input
          id="name"
          type="name"
          name="name"
          required
          autoComplete="name"
          placeholder="Jhon"
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:focus:border-zinc-100 dark:focus:ring-zinc-100/10"
        />
        <button
          type="submit"
          className="mt-2 inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 focus:ring-offset-white active:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus:ring-zinc-100 dark:focus:ring-offset-zinc-900 cursor-pointer"
        >
          Submit name
        </button>
      </form>

      <form action={insertTransaction}>
        <label
          htmlFor="amount"
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Amount:{" "}
        </label>
        <input
          id="amount"
          type="amount"
          name="amount"
          required
          autoComplete="amount"
          placeholder="10"
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:focus:border-zinc-100 dark:focus:ring-zinc-100/10"
        />
        <label
          htmlFor="description"
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Description:{" "}
        </label>
        <input
          id="description"
          type="description"
          name="description"
          autoComplete="description"
          placeholder="Lunch at Burger King"
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:focus:border-zinc-100 dark:focus:ring-zinc-100/10"
        />
        <label
          htmlFor="category"
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Category:{" "}
        </label>
        <input
          id="category"
          type="category"
          name="category"
          autoComplete="category"
          placeholder="Restaurant"
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:focus:border-zinc-100 dark:focus:ring-zinc-100/10"
        />
        <button
          type="submit"
          className="mt-2 inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 focus:ring-offset-white active:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus:ring-zinc-100 dark:focus:ring-offset-zinc-900 cursor-pointer"
        >
          Insert transaction
        </button>
      </form>
    </>
  );
}

"use client";

import { useState, useActionState } from "react";
import { addTransaction } from "./actions";
import { uploadReceipt } from "./client-actions";
import type { Category, Transaction } from "./types";

interface AddTransactionFormProps {
  categories_list: Category[];
  addOptimistic: (tx: Transaction) => void;
}

export function AddTransactionForm({
  categories_list,
  addOptimistic,
}: AddTransactionFormProps) {
  const [pathName, setPathName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [state, formAction, isPending] = useActionState(
    async (prevState: { error: string | null }, formData: FormData) => {
      const amount = parseFloat(formData.get("amount") as string);
      const category_id = formData.get("category") as string;

      // Skip the optimistic row if the amount isn't even a number
      if (Number.isFinite(amount)) {
        addOptimistic({
          id: crypto.randomUUID(),
          user_id: "",
          category_id,
          category:
            categories_list.find((c) => c.id === category_id)?.name ?? "",
          amount: Math.round(amount * 100),
          description: formData.get("description") as string,
          date: new Date().toISOString().slice(0, 10),
          receiptUrl: null,
          pending: true,
        });
      }

      return addTransaction(prevState, formData);
    },
    { error: null },
  );

  const handleFileChange = async (file: File) => {
    setIsUploading(true);
    const newPathName = await uploadReceipt(file);
    if (newPathName) {
      setPathName(newPathName);
    }
    setIsUploading(false);
  };

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="mb-5 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        Add transaction
      </h2>

      <form action={formAction} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="amount"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Amount
          </label>
          <input
            id="amount"
            type="text"
            name="amount"
            required
            autoComplete="off"
            placeholder="10"
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:focus:border-zinc-100 dark:focus:ring-zinc-100/10"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="description"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Description
          </label>
          <input
            id="description"
            type="text"
            name="description"
            autoComplete="off"
            placeholder="Lunch at Burger King"
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:focus:border-zinc-100 dark:focus:ring-zinc-100/10"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="category"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Category
          </label>
          <select
            id="category"
            name="category"
            autoComplete="off"
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-100 dark:focus:ring-zinc-100/10"
          >
            <option value="">Select a category</option>
            {categories_list &&
              categories_list.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="receipt"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Receipt
          </label>
          <input
            id="receipt"
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileChange(file);
            }}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-100 file:px-3 file:py-1 file:text-sm file:font-medium file:text-zinc-700 hover:file:bg-zinc-200 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:file:bg-zinc-800 dark:file:text-zinc-200 dark:focus:border-zinc-100 dark:focus:ring-zinc-100/10"
          />
          {isUploading && (
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              Uploading…
            </span>
          )}
        </div>

        <input
          id="path"
          readOnly
          name="path"
          value={pathName}
          className="hidden"
        />

        {state && state.error && <p style={{ color: "red" }}>{state.error}</p>}

        <button
          disabled={isUploading || isPending}
          type="submit"
          className="inline-flex w-full items-center justify-center rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 focus:ring-offset-white active:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus:ring-zinc-100 dark:focus:ring-offset-zinc-900 cursor-pointer"
        >
          {isPending ? "Inserting transaction..." : "Insert transaction"}
        </button>
      </form>
    </section>
  );
}

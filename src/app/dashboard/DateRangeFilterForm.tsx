"use client";

import type { FilterState } from "./types";
import { FieldError } from "./FieldError";

interface DateRangeFilterFormProps {
  state: FilterState;
  formAction: (formData: FormData) => void;
  isPending: boolean;
}

const inputClassName =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-100 dark:focus:ring-zinc-100/10";

export function DateRangeFilterForm({
  state,
  formAction,
  isPending,
}: DateRangeFilterFormProps) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="mb-5 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        Filter by date
      </h2>

      <form action={formAction} className="flex flex-col gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="from"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              From
            </label>
            <input id="from" type="date" name="from" className={inputClassName} />
            <FieldError errors={state.errors} field="from" />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="to"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              To
            </label>
            <input id="to" type="date" name="to" className={inputClassName} />
            {/* The schema's .refine() attaches the cross-field error to "to" */}
            <FieldError errors={state.errors} field="to" />
          </div>
        </div>

        {!state.success && state.message && (
          <p style={{ color: "red" }}>{state.message}</p>
        )}

        <div className="flex gap-3">
          <button
            disabled={isPending}
            type="submit"
            className="inline-flex flex-1 items-center justify-center rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 focus:ring-offset-white active:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus:ring-zinc-100 dark:focus:ring-offset-zinc-900 cursor-pointer"
          >
            {isPending ? "Filtering..." : "Apply filter"}
          </button>
          {state.transactions && (
            <button
              disabled={isPending}
              type="submit"
              name="intent"
              value="clear"
              className="inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-900 shadow-sm transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </form>
    </section>
  );
}

"use client";

import type { Dispatch } from "react";
import type { Filters, FilterAction } from "@/lib/filters";
import type { Category } from "./types";

interface FilterBarProps {
  filters: Filters;
  dispatch: Dispatch<FilterAction>;
  categories_list: Category[];
}

const inputClassName =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-100 dark:focus:ring-zinc-100/10";

const labelClassName = "text-sm font-medium text-zinc-700 dark:text-zinc-300";

const TYPES: { value: Filters["type"]; label: string }[] = [
  { value: "all", label: "All" },
  { value: "income", label: "Income" },
  { value: "expense", label: "Expense" },
];

export function FilterBar({
  filters,
  dispatch,
  categories_list,
}: FilterBarProps) {
  // Empty <input> values come back as "", but the reducer models "no filter" as null
  const toNull = (v: string) => (v === "" ? null : v);

  const isDirty =
    filters.from !== null ||
    filters.to !== null ||
    filters.categoryId !== null ||
    filters.type !== "all" ||
    filters.search !== "";

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Filters
        </h2>
        {isDirty && (
          <button
            type="button"
            onClick={() => dispatch({ type: "reset" })}
            className="text-sm font-medium text-zinc-600 underline-offset-4 hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-100 cursor-pointer"
          >
            Reset
          </button>
        )}
      </div>

      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label htmlFor="search" className={labelClassName}>
            Search
          </label>
          <input
            id="search"
            type="search"
            placeholder="Description contains…"
            value={filters.search}
            onChange={(e) =>
              dispatch({ type: "setSearch", search: e.target.value })
            }
            className={inputClassName}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label htmlFor="category" className={labelClassName}>
              Category
            </label>
            <select
              id="category"
              value={filters.categoryId ?? ""}
              onChange={(e) =>
                dispatch({
                  type: "setCategory",
                  categoryId: toNull(e.target.value),
                })
              }
              className={inputClassName}
            >
              <option value="">All categories</option>
              {categories_list.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <span className={labelClassName}>Type</span>
            <div
              role="radiogroup"
              aria-label="Transaction type"
              className="grid grid-cols-3 rounded-lg border border-zinc-300 p-1 dark:border-zinc-700"
            >
              {TYPES.map(({ value, label }) => {
                const active = filters.type === value;
                return (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => dispatch({ type: "setType", value })}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                      active
                        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                        : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label htmlFor="from" className={labelClassName}>
              From
            </label>
            <input
              id="from"
              type="date"
              value={filters.from ?? ""}
              max={filters.to ?? undefined}
              onChange={(e) =>
                dispatch({
                  type: "setRange",
                  from: toNull(e.target.value),
                  to: filters.to,
                })
              }
              className={inputClassName}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="to" className={labelClassName}>
              To
            </label>
            <input
              id="to"
              type="date"
              value={filters.to ?? ""}
              min={filters.from ?? undefined}
              onChange={(e) =>
                dispatch({
                  type: "setRange",
                  from: filters.from,
                  to: toNull(e.target.value),
                })
              }
              className={inputClassName}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

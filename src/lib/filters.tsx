export type Filters = {
  from: string | null;
  to: string | null;
  categoryId: string | null;
  type: "all" | "income" | "expense";
  search: string;
};

export type FilterAction =
  | { type: "setRange"; from: string | null; to: string | null }
  | { type: "setCategory"; categoryId: string | null }
  | { type: "setType"; value: Filters["type"] }
  | { type: "setSearch"; search: string }
  | { type: "reset" };

export const initialFilters: Filters = {
  from: null,
  to: null,
  categoryId: null,
  type: "all",
  search: "",
};

export function filtersReducer(state: Filters, action: FilterAction): Filters {
  switch (action.type) {
    case "setRange":
      return { ...state, from: action.from, to: action.to };
    case "setCategory":
      return { ...state, categoryId: action.categoryId };
    case "setType":
      return { ...state, type: action.value };
    case "setSearch":
      return { ...state, search: action.search };
    case "reset":
      return initialFilters;
  }
}

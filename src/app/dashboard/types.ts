export interface Transaction {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  receiptUrl: string | null;
  // Storage path from the DB row; receiptUrl is the signed URL derived from it
  receipt_path?: string | null;
  pending?: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export type Profile = {
  display_name: string | null;
};

export type MonthlySummary = {
  total: number;
  transactions: Transaction[];
};

export type ActionState = {
  errors: Partial<Record<string, string[]>>;
  message: string | null;
  success: boolean;
};

export const initialState: ActionState = {
  errors: {},
  message: null,
  success: false,
};

export type FilterState = ActionState & {
  // null = no filter applied, show the default monthly list
  transactions: Transaction[] | null;
};

export const initialFilterState: FilterState = {
  ...initialState,
  transactions: null,
};

export type Result<T> = { ok: true; data: T } | { ok: false; error: string };

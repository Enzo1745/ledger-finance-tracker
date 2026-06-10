export interface Transaction {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  receiptUrl: string | null;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

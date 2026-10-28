type SummaryProps = { balance: number };

export default function Summary({ balance }: SummaryProps) {
  // Display: divide by 100 for euros
  const euros = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  });
  const formatted = euros.format(balance / 100);

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
        Balance
      </p>
      <p className="mt-1 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        {formatted}
      </p>
    </section>
  );
}

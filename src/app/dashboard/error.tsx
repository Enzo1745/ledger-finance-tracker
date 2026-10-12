"use client";
export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <p>Something went wrong loading your dashboard.</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}

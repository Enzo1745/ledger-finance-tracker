"use client";
import { signOut } from "./actions";

export default function DashboardClient({ email }: { email: string }) {
  return (
    <>
      <p>{email} is logged in!</p>
      <button onClick={() => signOut()} className="hover:cursor-pointer">
        Sign out
      </button>
    </>
  );
}

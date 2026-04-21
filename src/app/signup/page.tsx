import { signup } from "./actions";

export default function Signup() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <form action={signup}>
          <label htmlFor="email">Email:</label>
          <br />
          <input type="text" name="email" placeholder="example@gmail.com" />
          <br />
          <label htmlFor="password">Password:</label>
          <br />
          <input type="text" name="password" placeholder="********" />
          <br />
          <button type="submit" className="hover:cursor-pointer">
            Sign up
          </button>
        </form>{" "}
      </main>
    </div>
  );
}

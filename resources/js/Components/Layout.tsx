import { AuthContext } from "@/context";
import { PageProps } from "@/types/models";
import { Head } from "@inertiajs/react";
import { PropsWithChildren } from "react";

type LayoutProps = PropsWithChildren<{
  auth: PageProps["auth"];
  title: string;
}>;

export default function Layout({ auth, title, children }: LayoutProps) {
  return (
    <AuthContext.Provider value={auth}>
      <Head title={title} />
      <header className="border-b">
        <div className="container flex justify-between items-center py-3">
          <a href="/">Tasks</a>
          <details>
            <summary>{auth.user.name}</summary>
            <ul>
              <li>
                <a href="/account">Account</a>
              </li>
              <li>
                <form method="POST" action={route("logout")}>
                  <button type="submit">Log out</button>
                </form>
              </li>
            </ul>
          </details>
        </div>
      </header>
      <main>
        <div className="container py-6" v-bind="$attrs">
          {children}
        </div>
      </main>
    </AuthContext.Provider>
  );
}

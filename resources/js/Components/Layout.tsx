import { AuthContext } from "@/context";
import { PageProps } from "@/types";
import { Head } from "@inertiajs/react";
import { PropsWithChildren } from "react";
import Form from "@/Components/Form";

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
                <Form method="POST" action={route("logout")}>
                  <button type="submit">Log out</button>
                </Form>
              </li>
            </ul>
          </details>
        </div>
      </header>
      <main>
        <div className="container max-w-2xl py-6">{children}</div>
      </main>
    </AuthContext.Provider>
  );
}

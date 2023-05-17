import { AuthContext } from "@/context";
import { PageProps } from "@/types";
import { Head } from "@inertiajs/react";
import { PropsWithChildren, useId } from "react";
import Form from "@/Components/Form";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

type LayoutProps = PropsWithChildren<{
  auth: PageProps["auth"];
  title: string;
}>;

export default function Layout({ auth, title, children }: LayoutProps) {
  const logOutFormId = useId();
  const dropdownMenuItemClass =
    "px-2 py-1 block w-full text-left rounded-md hover:bg-gray-100";

  return (
    <AuthContext.Provider value={auth}>
      <Head title={title} />
      <header className="border-b">
        <div className="container flex justify-between items-center py-3">
          <a href="/">Tasks</a>

          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button type="button">{auth.user.name}</button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                sideOffset={12}
                className="w-48 border rounded-md shadow-lg p-2 bg-white"
              >
                <DropdownMenu.Item asChild className={dropdownMenuItemClass}>
                  {/* TODO: icon */}
                  <a href="/account">Account</a>
                </DropdownMenu.Item>

                <DropdownMenu.Item asChild className={dropdownMenuItemClass}>
                  {/* TODO: icon */}
                  <a href="/TODO">Completed tasks</a>
                </DropdownMenu.Item>

                <DropdownMenu.Separator className="border-t my-2" />

                <DropdownMenu.Item asChild className={dropdownMenuItemClass}>
                  {/* TODO: icon */}
                  <button type="submit" form={logOutFormId}>
                    Log out
                  </button>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
          <Form
            method="POST"
            action={route("logout")}
            id={logOutFormId}
            className="sr-only"
          ></Form>
        </div>
      </header>
      <main>
        <div className="container max-w-2xl py-6">{children}</div>
      </main>
    </AuthContext.Provider>
  );
}

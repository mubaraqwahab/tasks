import { AuthContext } from "@/context";
import { PageProps } from "@/types";
import { Head, Link } from "@inertiajs/react";
import { PropsWithChildren, useId, useState } from "react";
import Form from "@/Components/Form";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";

type LayoutProps = PropsWithChildren<{
  auth: PageProps["auth"];
  title: string;
}>;

export default function Layout({ auth, title, children }: LayoutProps) {
  const [isDropdownMenuOpen, setIsDropdownMenuOpen] = useState(false);
  const logOutFormId = useId();
  const dropdownMenuItemClass =
    "px-2 py-1 block w-full text-left rounded-md hover:bg-gray-100";

  return (
    <AuthContext.Provider value={auth}>
      <Head title={title} />
      <header className="border-b">
        <div className="container flex justify-between items-center py-3">
          <Link href="/" className="font-medium">
            Tasks
          </Link>

          <DropdownMenu.Root
            open={isDropdownMenuOpen}
            onOpenChange={setIsDropdownMenuOpen}
          >
            <DropdownMenu.Trigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-1.5"
              >
                <span>{auth.user.name}</span>
                <ChevronDownIcon
                  className={clsx(
                    "h-4 w-4 transition-transform duration-200",
                    isDropdownMenuOpen && "rotate-180"
                  )}
                />
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                sideOffset={10}
                className="w-56 border rounded-md shadow-lg p-2 bg-white"
              >
                <DropdownMenu.Item asChild className={dropdownMenuItemClass}>
                  {/* TODO: icon */}
                  <Link href={route("profile.edit")}>Account</Link>
                </DropdownMenu.Item>

                <DropdownMenu.Item asChild className={dropdownMenuItemClass}>
                  {/* TODO: icon */}
                  <Link href="/TODO">Completed tasks</Link>
                </DropdownMenu.Item>

                <DropdownMenu.Separator className="border-t my-1.5" />

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

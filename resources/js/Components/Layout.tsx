import { AuthContext } from "@/context";
import { PageProps } from "@/types";
import { Head, Link } from "@inertiajs/react";
import { PropsWithChildren, useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";

type LayoutProps = PropsWithChildren<{
  auth: PageProps["auth"];
  title: string;
}>;

export default function Layout({ auth, title, children }: LayoutProps) {
  const [isDropdownMenuOpen, setIsDropdownMenuOpen] = useState(false);
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

          {auth ? (
            <DropdownMenu.Root
              modal={false}
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
                  loop
                  className="w-40 border rounded-md shadow-lg p-1 bg-white"
                >
                  <DropdownMenu.Item asChild className={dropdownMenuItemClass}>
                    {/* TODO: icon */}
                    <Link href={route("profile.edit")}>Account</Link>
                  </DropdownMenu.Item>

                  <DropdownMenu.Item asChild className={dropdownMenuItemClass}>
                    {/* TODO: icon */}
                    <Link
                      href={route("logout")}
                      method="post"
                      as="button"
                      onBefore={() => {
                        // TODO: this is suboptimal
                        localStorage.removeItem("taskChangelog");
                      }}
                    >
                      Log out
                    </Link>
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          ) : (
            <a
              href={route("login.google")}
              className="flex p-2 justify-center border border-gray-400 rounded-md font-medium mb-5 bg-gray-100 hover:bg-gray-200"
            >
              Continue with Google
            </a>
          )}
        </div>
      </header>
      <main>
        <div className="container max-w-2xl py-6">{children}</div>
      </main>
    </AuthContext.Provider>
  );
}

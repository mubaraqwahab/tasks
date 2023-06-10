import { Head, Link } from "@inertiajs/react";
import { PropsWithChildren, useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";
import { TASK_CHANGELOG_STORAGE_KEY, useAuth } from "@/utils";

type LayoutProps = PropsWithChildren<{
  title: string;
}>;

export default function Layout({ title, children }: LayoutProps) {
  const auth = useAuth();
  const [isDropdownMenuOpen, setIsDropdownMenuOpen] = useState(false);
  const dropdownMenuItemClass =
    "px-2 py-1 block w-full text-left rounded-md hover:bg-gray-100";

  return (
    <>
      <Head title={title} />
      <header className="border-b sticky top-0 left-0 bg-white">
        <div className="container flex justify-between items-center py-3">
          <Link href={route("tasks.index")} className="font-medium">
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
                  className="w-48 border rounded-md shadow-lg p-1 bg-white"
                >
                  <DropdownMenu.Item asChild className={dropdownMenuItemClass}>
                    {/* TODO: icon */}
                    <Link href={route("account.edit")}>Account</Link>
                  </DropdownMenu.Item>

                  <DropdownMenu.Item asChild className={dropdownMenuItemClass}>
                    {/* TODO: icon */}
                    <Link
                      href={route("logout")}
                      method="post"
                      as="button"
                      onBefore={() => {
                        // TODO: this is suboptimal
                        localStorage.removeItem(TASK_CHANGELOG_STORAGE_KEY);
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
        <div className="container max-w-2xl pt-6 pb-8">{children}</div>
      </main>
    </>
  );
}

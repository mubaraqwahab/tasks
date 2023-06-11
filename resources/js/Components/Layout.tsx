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

  return (
    <>
      <Head title={title} />
      <header className="border-b sticky top-0 left-0 bg-white">
        <div className="container flex justify-between items-center py-2">
          <Link href="/" className="font-medium text-lg">
            Tasks
          </Link>

          {auth ? (
            <div className="flex items-center space-x-2 lg:space-x-3">
              <Link href={route("tasks.index")} className="HeaderItem">
                My tasks
              </Link>
              <AccountDropdownMenu />
            </div>
          ) : (
            <a
              href={route("login.google")}
              className="HeaderItem border border-gray-400 font-semibold py-1 text-sm bg-gray-100 hover:bg-gray-200"
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

function AccountDropdownMenu() {
  const auth = useAuth()!;
  const [isDropdownMenuOpen, setIsDropdownMenuOpen] = useState(false);
  const dropdownMenuItemClass =
    "px-2 py-1 block w-full text-left rounded-md hover:bg-gray-100";

  return (
    <DropdownMenu.Root
      modal={false}
      open={isDropdownMenuOpen}
      onOpenChange={setIsDropdownMenuOpen}
    >
      <DropdownMenu.Trigger asChild>
        <button type="button" className="HeaderItem px-0 gap-1.5">
          <span>{auth.user.name}</span>
          <ChevronDownIcon
            className={clsx("h-4 w-4", isDropdownMenuOpen && "rotate-180")}
          />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={5}
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
  );
}

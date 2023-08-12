import { Head } from "@inertiajs/react";
import { PropsWithChildren, useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";
import { TASK_CHANGELOG_STORAGE_KEY, useAuth } from "@/utils";
import DetachedFormButton from "./DetachedFormButton";

type LayoutProps = PropsWithChildren<{
  title: string;
}>;

export default function Layout({ title, children }: LayoutProps) {
  return (
    <>
      <Head title={title} />
      <header className="border-b bg-white">
        <div className="container flex justify-between items-center py-2">
          <a href={route("tasks.index")} className="font-medium text-lg">
            Tasks
          </a>

          <AccountDropdownMenu />
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
    "px-2 py-1 mx-1 text-left rounded-md hover:bg-gray-100";

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
          className="w-48 py-1 border rounded-md shadow-lg bg-white flex flex-col"
        >
          <DropdownMenu.Item asChild className={dropdownMenuItemClass}>
            <a href={route("account.edit")}>Account</a>
          </DropdownMenu.Item>

          <DropdownMenu.Item
            asChild
            className={dropdownMenuItemClass}
            // On click, don't close the dropdown, so that the form button
            // (and form) remain mounted and the form gets submitted.
            onSelect={(e) => e.preventDefault()}
          >
            <DetachedFormButton
              formAction={route("logout")}
              formMethod="POST"
              onClick={() => {
                // TODO: this is suboptimal
                localStorage.removeItem(TASK_CHANGELOG_STORAGE_KEY);
              }}
            >
              Log out
            </DetachedFormButton>
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="border-b my-1" />

          <DropdownMenu.Item asChild className={dropdownMenuItemClass}>
            <a href={route("about")}>About Tasks</a>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

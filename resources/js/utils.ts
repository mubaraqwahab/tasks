import { usePage } from "@inertiajs/react";
import { FormEvent } from "react";
import { PageProps } from "./types";

/**
 * Prevent default without typing `e.preventDefault()`
 * @example
 * <form onSubmit={p((e) => console.log(e.target))} />
 */
export function p<E extends FormEvent>(listener: (e: E) => void) {
  return function (e: E) {
    e.preventDefault();
    listener(e);
  };
}

export const NONEMPTY_WHEN_TRIMMED_PATTERN = String.raw`\s*\S(.*\S)?\s*`;

export const TASK_CHANGELOG_STORAGE_KEY = "taskChangelog";

export function useAuth() {
  const page = usePage<PageProps>();
  return page.props.auth;
}

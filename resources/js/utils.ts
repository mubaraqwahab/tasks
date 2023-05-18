import { FormEvent } from "react";

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

export const NOT_WHITESPACE_ONLY_PATTERN = String.raw`\s*\S(.*\S)?\s*`;

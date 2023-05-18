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


export const taskNameInputValidationProps: JSX.IntrinsicElements["input"] = {
  type: "text",
  required: true,
  maxLength: 255,
  // Not whitespace only
  pattern: String.raw`\s*\S(.*\S)?\s*`,
  onInvalid: (e) => {
    const input = e.target as HTMLInputElement;
    // Don't worry about other errors, as the browser's default messages suffice.
    // Note that the input validity states are not mutually exclusive. So the
    // validity.valueMissing and validity.patternMismatch states could both be true.
    if (input.validity.valueMissing || input.validity.tooLong) return

    if (input.validity.patternMismatch) {
      input.setCustomValidity("The task name can't be just whitespace");
      input.reportValidity();
    }
  },
};

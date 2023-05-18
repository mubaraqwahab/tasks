import { ReactNode } from "react";

export type ForProps<T> = React.HTMLAttributes<HTMLUListElement> & {
  /** The list to render */
  each: T[];
  /** A render function to render an item of the list */
  render: (item: T, index: number) => ReactNode;
  /** What to render if the list is empty */
  fallback: ReactNode;
};

/**
 * A convenience component for rendering a list of items.
 * Inspired by Solid JS
 */
export default function For<T>({
  each,
  render,
  fallback,
  ...rest
}: ForProps<T>) {
  return <>{each.length ? <ul {...rest}>{each.map(render)}</ul> : fallback}</>;
}

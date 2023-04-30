import { AuthContext } from "@/context";
import { PropsWithChildren, useContext } from "react";

type FormProps = React.FormHTMLAttributes<HTMLFormElement> &
  PropsWithChildren<{
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  }>;

const htmlMethods = ["GET", "POST"];

/** A form component with method spoofing and CSRF input */
export default function Form({ method = "GET", children, ...rest }: FormProps) {
  const { csrfToken } = useContext(AuthContext);
  return (
    <>
      <form method={method === "GET" ? method : "POST"} {...rest}>
        {method !== "GET" && (
          <input type="hidden" name="_token" value={csrfToken} />
        )}
        {!htmlMethods.includes(method) && (
          <input type="hidden" name="_method" value={method} />
        )}
        {children}
      </form>
    </>
  );
}

import { useAuth } from "@/utils";
import { PropsWithChildren, forwardRef, useContext } from "react";

type MyFormProps = React.FormHTMLAttributes<HTMLFormElement> &
  PropsWithChildren<{
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  }>;

const htmlMethods = ["GET", "POST"];

/** A form component with method spoofing and CSRF input */
const MyForm = forwardRef<HTMLFormElement, MyFormProps>(function MyForm(
  { method = "GET", children, ...rest },
  ref
) {
  const auth = useAuth();
  return (
    <>
      <form ref={ref} method={method === "GET" ? method : "POST"} {...rest}>
        {method !== "GET" && auth && (
          <input type="hidden" name="_token" value={auth.csrfToken} />
        )}
        {!htmlMethods.includes(method) && (
          <input type="hidden" name="_method" value={method} />
        )}
        {children}
      </form>
    </>
  );
});

export default MyForm;

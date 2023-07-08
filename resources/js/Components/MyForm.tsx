import { useAuth } from "@/utils";
import { Method } from "@inertiajs/core";
import { PropsWithChildren, forwardRef } from "react";

export type FormMethod = Method | Uppercase<Method>;

type MyFormProps = React.FormHTMLAttributes<HTMLFormElement> & {
  method?: FormMethod;
};

const htmlMethods = ["GET", "POST"];

/** A form component with method spoofing and CSRF input */
const MyForm = forwardRef<HTMLFormElement, MyFormProps>(function MyForm(
  { method = "GET", children, ...rest },
  ref
) {
  const auth = useAuth();
  const uppercasedMethod = method.toUpperCase();
  return (
    <form
      ref={ref}
      method={uppercasedMethod === "GET" ? uppercasedMethod : "POST"}
      {...rest}
    >
      {uppercasedMethod !== "GET" && auth && (
        <input type="hidden" name="_token" value={auth.csrfToken} />
      )}
      {!htmlMethods.includes(uppercasedMethod) && (
        <input type="hidden" name="_method" value={uppercasedMethod} />
      )}
      {children}
    </form>
  );
});

export default MyForm;

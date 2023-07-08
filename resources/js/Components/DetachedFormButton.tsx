import { forwardRef, useId } from "react";
import MyForm, { FormMethod } from "@/Components/MyForm";
import { createPortal } from "react-dom";

type DetachedFormButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  formMethod?: FormMethod;
};

const DetachedFormButton = forwardRef<
  HTMLButtonElement,
  DetachedFormButtonProps
>(function DetachedFormButton({ formMethod, ...rest }, ref) {
  const formId = useId();
  return (
    <>
      <button {...rest} form={formId} ref={ref} type="submit" />
      {createPortal(
        // Put the method on the form, not the button,
        // so the form adds spoofing and CSRF inputs as needed
        <MyForm id={formId} method={formMethod} hidden />,
        document.body
      )}
    </>
  );
});

export default DetachedFormButton;

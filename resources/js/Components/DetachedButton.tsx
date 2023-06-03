import {
  PropsWithChildren,
  createContext,
  forwardRef,
  useContext,
  useId,
} from "react";
import MyForm from "@/Components/MyForm";

type DetachedButtonContextValue = {
  formId: string;
};

const DetachedButtonContext = createContext({} as DetachedButtonContextValue);

export function DetachedButtonProvider({ children }: PropsWithChildren) {
  const formId = useId();
  return (
    <DetachedButtonContext.Provider value={{ formId }}>
      {children}
      <MyForm id={formId} hidden />
    </DetachedButtonContext.Provider>
  );
}

type DetachedButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

// TODO: use for progressive enhancement

const DetachedButton = forwardRef<HTMLButtonElement, DetachedButtonProps>(
  function DetachedButton(props, ref) {
    const { formId } = useContext(DetachedButtonContext);
    return <button form={formId} ref={ref} {...props} />;
  }
);

export default DetachedButton;

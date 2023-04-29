import { createContext } from "react";
import { PageProps } from "./types";

export const AuthContext = createContext({} as PageProps["auth"]);

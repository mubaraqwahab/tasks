import { createContext } from "react";
import { PageProps } from "./types/models";

export const AuthContext = createContext({} as PageProps["auth"]);

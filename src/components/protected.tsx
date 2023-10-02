import { useUser } from "@components/userprovider";
import React, { FC, PropsWithChildren } from "react";

interface ProtectedProps {
  fallback?: React.ReactNode;
  redirect: React.ReactNode | (() => React.ReactNode);
}

export const Protected: FC<ProtectedProps & PropsWithChildren> = ({
  fallback,
  children,
  redirect,
}) => {
  const { isloading, user } = useUser();

  //loading
  if (isloading && !user) return <>{fallback}</>;
  //offline redirect
  else if (!isloading && !user)
    return typeof redirect === "function" ? redirect() : redirect;
  //online page
  else return <>{children}</>;
};

import { useUser } from "@components/userprovider";
import React, { FC, PropsWithChildren } from "react";

interface UnProtectedProps {
  fallback?: React.ReactNode;
  redirect: React.ReactNode | (() => React.ReactNode);
}

export const UnProtected: FC<UnProtectedProps & PropsWithChildren> = ({
  fallback,
  children,
  redirect,
}) => {
  const { isloading, user } = useUser();

  //loading
  if (isloading && !user) return <>{fallback}</>;
  //online redirect
  else if (!isloading && user)
    return typeof redirect === "function" ? redirect() : redirect;
  //offline page
  else return <>{children}</>;
};

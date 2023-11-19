import { useUser } from "@components/userprovider";
import { FC } from "react";

interface OnlineProps {
  fallback?: React.ReactNode;
  offline?: React.ReactNode | (() => React.ReactNode);
  children: ((user: unknown) => React.ReactNode) | React.ReactNode;
}

export const Online: FC<OnlineProps> = ({
  fallback = "loading...",
  children,
  offline,
}) => {
  const { isloading, user } = useUser();

  if (isloading && !user) return <>{fallback}</>;
  else if (!isloading && !user)
    return typeof offline === "function" ? offline() : offline;
  else
    return typeof children === "function" && user ? (
      <>{children(user)}</>
    ) : (
      <>{children}</>
    );
};

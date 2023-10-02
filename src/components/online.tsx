import { useUser } from "@components/userprovider";
import { FC } from "react";

interface OnlineProps {
  fallback?: React.ReactNode;
  offline?: React.ReactNode;
  children: ((user: any) => React.ReactNode) | React.ReactNode;
}

export const Online: FC<OnlineProps> = ({ children, fallback, offline }) => {
  const { isloading, user } = useUser();

  if (isloading && !user) return <>{fallback}</>;
  else if (!isloading && !user) return <>{offline}</>;
  else
    return typeof children === "function" && user ? (
      <>{children(user)}</>
    ) : (
      <>{children}</>
    );
};

import { useUser } from "@components/userprovider";
import { FC, PropsWithChildren } from "react";

interface OfflineProps extends PropsWithChildren {
  fallback?: React.ReactNode;
  online?: React.ReactNode;
}

export const Offline: FC<OfflineProps> = ({ children, fallback, online }) => {
  const { isloading, user } = useUser();

  if (isloading && !user) return <>{fallback}</>;
  else if (!isloading && user) return <>{online}</>;
  else return <>{children}</>;
};

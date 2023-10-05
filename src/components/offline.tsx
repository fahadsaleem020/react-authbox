import { useUser } from "@components/userprovider";
import { FC, PropsWithChildren } from "react";

interface OfflineProps extends PropsWithChildren {
  fallback?: React.ReactNode;
  online?: React.ReactNode | ((user: any) => React.ReactNode);
}

export const Offline: FC<OfflineProps> = ({
  fallback = "loading...",
  children,
  online,
}) => {
  const { isloading, user } = useUser();

  if (isloading && !user) return <>{fallback}</>;
  else if (!isloading && user)
    return typeof online === "function" ? online(user) : online;
  else return <>{children}</>;
};

() => <Offline online={(user) => ""}>yes</Offline>;

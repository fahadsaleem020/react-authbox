import { FC, PropsWithChildren } from "react";
interface OfflineProps extends PropsWithChildren {
    fallback?: React.ReactNode;
    online?: React.ReactNode | ((user: unknown) => React.ReactNode);
}
export declare const Offline: FC<OfflineProps>;
export {};

import { FC } from "react";
interface OnlineProps {
    fallback?: React.ReactNode;
    offline?: React.ReactNode | (() => React.ReactNode);
    children: ((user: unknown) => React.ReactNode) | React.ReactNode;
}
export declare const Online: FC<OnlineProps>;
export {};

import { FC } from "react";
interface OnlineProps {
    fallback?: React.ReactNode;
    offline?: React.ReactNode;
    children: ((user: any) => React.ReactNode) | React.ReactNode;
}
export declare const Online: FC<OnlineProps>;
export {};

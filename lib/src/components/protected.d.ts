import React, { FC, PropsWithChildren } from "react";
interface ProtectedProps {
    fallback?: React.ReactNode;
    redirect: React.ReactNode | (() => React.ReactNode);
}
export declare const Protected: FC<ProtectedProps & PropsWithChildren>;
export {};

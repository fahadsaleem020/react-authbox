import React, { FC, PropsWithChildren } from "react";
interface UnProtectedProps {
    fallback?: React.ReactNode;
    redirect: React.ReactNode | (() => React.ReactNode);
}
export declare const UnProtected: FC<UnProtectedProps & PropsWithChildren>;
export {};

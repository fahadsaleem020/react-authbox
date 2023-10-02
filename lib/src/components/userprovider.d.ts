import { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import React, { PropsWithChildren, SetStateAction, Dispatch, FC } from "react";
type ContextData = {
    user?: any;
    isloading: boolean;
    fetchUser: () => Promise<void>;
    setUser: React.Dispatch<React.SetStateAction<ContextData["user"]>>;
};
export declare const useUser: () => ContextData;
export declare const Provider: FC<PropsWithChildren & {
    /**
     * @type string
     *
     * @description url to fetch the user information from
     */
    fetchUserUrl: string;
    /**
     * @type boolean
     * @default false
     * @description continiously refetch from fetchUserUrl if it fails to get user info, should be used for development purpose.
     */
    refetchOnServerError?: boolean;
    /**
     * @type callback
     * @param error AxioxError
     * @returns void
     * @description contains error info if the fetchUserUrl fails to get user info
     */
    onError?: (error: AxiosError) => void;
}>;
export declare const useAuthentication: () => {
    signin: (p: ISignin) => Promise<void>;
    signout: (p: ISignout) => Promise<void>;
    /**
     * @description handle with try catch
     * @returns axios response
     */
    log: <T>(p: ILog) => Promise<void | AxiosResponse<T, any>>;
    submissionState: boolean;
    setSubmissionState: React.Dispatch<React.SetStateAction<boolean>>;
    error: AxiosError<unknown, any> | undefined;
};
interface ISignin extends Partial<Pick<ContextData, "fetchUser">> {
    credentials: any;
    url: string;
    setSubmissionState?: Dispatch<SetStateAction<boolean>>;
    setError?: Dispatch<SetStateAction<AxiosError | undefined>>;
}
type ILog = Omit<ISignin, "setUser" | "credentials"> & Omit<AxiosRequestConfig, "url">;
interface ISignout extends Partial<Pick<ContextData, "setUser">> {
    url: string;
    setSubmissionState?: Dispatch<SetStateAction<boolean>>;
    setError?: Dispatch<SetStateAction<AxiosError | undefined>>;
}
export {};

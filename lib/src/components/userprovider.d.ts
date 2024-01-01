import { AxiosError, AxiosResponse } from "axios";
import React, { PropsWithChildren, SetStateAction, Dispatch, FC } from "react";
interface ContextData {
    user: unknown;
    baseUrl: string;
    isloading: boolean;
    fetchUser: () => Promise<void>;
    setUser: React.Dispatch<React.SetStateAction<unknown>>;
}
interface UserProviderProps extends PropsWithChildren {
    /**
     * @type string
     * @description url to fetch the user information from
     */
    fetchUserFrom: string;
    /**
     * @type boolean
     * @default false
     * @description continuously refetch from fetchUserFrom if it fails to get user info, should be used for development purpose.
     */
    refetchOnServerError?: boolean;
    /**
     * @type function
     * @param error AxioxError
     * @returns void
     * @description contains error info if the fetchUserFrom fails to get user info
     */
    onError?: (error: AxiosError) => void;
    /**
     * @type string
     * @description set the base url to be used in sign, signout and log functions.
     */
    baseUrl: string;
}
export declare const useUser: () => ContextData;
export declare const UserProvider: FC<UserProviderProps>;
export declare const useAuthentication: () => {
    signin: <Credentials>(p: SigninProps<Credentials>) => void;
    signout: (p: SignoutProps) => Promise<void>;
    /**
     * @description handle with try catch
     * @returns axios response
     */
    signup: <Credentials_1>(p: SignupProps<Credentials_1>) => Promise<AxiosResponse<any, any> | undefined>;
    submissionState: boolean;
    setSubmissionState: React.Dispatch<React.SetStateAction<boolean>>;
    error: AxiosError<unknown, any> | undefined;
};
interface BaseProps<Credentials> {
    setError?: Dispatch<SetStateAction<AxiosError | undefined>>;
    setSubmissionState?: Dispatch<SetStateAction<boolean>>;
    credentials: Credentials;
    url: string;
}
interface SigninProps<Credentials> extends Partial<Pick<ContextData, "fetchUser" | "baseUrl">>, BaseProps<Credentials> {
}
interface SignupProps<Credentials> extends Partial<Pick<ContextData, "baseUrl">>, BaseProps<Credentials> {
}
interface SignoutProps extends Partial<Pick<ContextData, "setUser" | "baseUrl">> {
    url: string;
    setSubmissionState?: Dispatch<SetStateAction<boolean>>;
    setError?: Dispatch<SetStateAction<AxiosError | undefined>>;
}
export {};

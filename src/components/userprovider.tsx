import axios, { AxiosError, AxiosResponse } from "axios";
import React, {
  PropsWithChildren,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
  Dispatch,
  FC,
} from "react";

interface ContextData<T = unknown> {
  user: T;
  baseUrl: string;
  isloading: boolean;
  fetchUser: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<T>>;
}

interface UserProviderProps extends PropsWithChildren {
  /**
   * @type string
   * @description Url to fetch the user information from on browser reoload.
   * @example
   * ```ts
   * fetchUserFrom="/user"
   * ```
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
   * @description contains errors stored by any of the authentication functions. This could be used to catch errors globally.
   */
  onError?: (error: AxiosError) => void;
  /**
   * @type object
   * @description Set the base url of backend to be used with authentication functions everywhere.
   * @example
   * ```ts
   *   baseUrl={{
        development: "http://localhost:3000/",
        production: "http://localhost:3000/",
      }}
   * ```
   */
  baseUrl: { production: string; development: string };
}

const UserContext = createContext<ContextData>({} as any);

export const useUser = <T,>() => useContext(UserContext) as ContextData<T>;

export const UserProvider: FC<UserProviderProps> = ({
  baseUrl,
  onError,
  children,
  fetchUserFrom,
  refetchOnServerError = false,
}) => {
  const [user, setUser] = useState<ContextData["user"]>();
  const [isloading, setIsloading] = useState(true);

  const sanitizeDomain = (domain: string) =>
    domain.at(-1) === "/" ? domain.slice(0, -1) + "/api" : domain + "/api";

  const enviroment = process.env.NODE_ENV as "production" | "development";
  const url = sanitizeDomain(baseUrl[enviroment]);

  const fetchUser = async () => {
    try {
      const { status, data } = await axios(url + fetchUserFrom, {
        withCredentials: true,
      });

      if (status === 200) {
        setUser(data);
      }
      setIsloading(false);
    } catch (error) {
      setIsloading(false);
      onError?.(error as AxiosError);
      const { code } = error as AxiosError;
      if (code === "ERR_NETWORK" && refetchOnServerError) fetchUser();
    }
  };

  useEffect(() => {
    fetchUser();
    return () => {
      setUser(undefined);
      setIsloading(true);
    };
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        isloading,
        fetchUser,
        baseUrl: url,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

type AxiosErrorWithMessage = AxiosError<{ message: string }>;

export const useAuthentication = () => {
  const [submissionState, setSubmissionState] = useState(false);
  const { setUser, fetchUser, baseUrl } = useUser();
  const [error, setError] = useState<AxiosErrorWithMessage>();

  return {
    signin: <Response = {}, Credentials = {}>(p: SignupProps<Credentials>) =>
      signin<Response, Credentials>({
        setSubmissionState,
        url: "/signin",
        fetchUser,
        setError,
        baseUrl,
        ...p,
      }),

    signout: <Response,>(p?: SignoutProps) =>
      signout<Response>({
        setSubmissionState,
        url: "/signout",
        setError,
        setUser,
        baseUrl,
        ...p,
      }),

    signup: <Response = {}, Credentials = {}>(p: SignupProps<Credentials>) =>
      signup<Response, Credentials>({
        setSubmissionState,
        setError,
        baseUrl,
        url: "/signup",
        ...p,
      }),

    requestpasswordreset: <Response,>(p: RequestPasswordResetProps) =>
      requestpasswordreset<Response>({
        url: "/requestpasswordreset",
        setSubmissionState,
        setError,
        baseUrl,
        ...p,
      }),

    resetpassword: <Response,>(p: ResetPasswordProps) =>
      resetpassword<Response>({
        url: "/resetpassword",
        setSubmissionState,
        fetchUser,
        setError,
        baseUrl,
        ...p,
      }),

    /**
     * @description
     * This creates a new user.This function is to be used after the signup.
     */

    verifyemail: <Response,>(p: VerifyEmailPropsGet | VerifyEmailPropsPost) =>
      verifyemail<Response>({
        setSubmissionState,
        url: "/verify",
        fetchUser,
        setError,
        baseUrl,
        ...p,
      }),

    setSubmissionState,
    submissionState,
    error,
  };
};

interface BaseProps<Credentials = {}> {
  setError?: Dispatch<SetStateAction<AxiosErrorWithMessage | undefined>>;
  setSubmissionState?: Dispatch<SetStateAction<boolean>>;
  credentials: Credentials;
  url?: string;
}

interface SigninProps<Credentials>
  extends Partial<Pick<ContextData, "fetchUser" | "baseUrl">>,
    BaseProps<Credentials> {}

type SigninFn = <Response, Credentials>(
  props: SigninProps<Credentials>
) => Promise<AxiosResponse<Response> | undefined>;

const signin: SigninFn = async ({
  setSubmissionState,
  credentials,
  fetchUser,
  setError,
  baseUrl,
  url,
}) => {
  try {
    setSubmissionState?.(true);
    const res = await axios(baseUrl! + url, {
      withCredentials: true,
      data: credentials,
      method: "POST",
    });

    if (res.status === 200) {
      setSubmissionState?.(false);
      setError?.(undefined);
      await fetchUser?.();
      return res;
    }
  } catch (error) {
    setSubmissionState?.(false);
    setError?.(error as AxiosErrorWithMessage);
  }
};

interface SignupProps<Credentials>
  extends Partial<Pick<ContextData, "baseUrl">>,
    BaseProps<Credentials> {}

type SignupFn = <Response, Credentials>(
  props: SignupProps<Credentials>
) => Promise<AxiosResponse<Response> | undefined>;

const signup: SignupFn = async ({
  setSubmissionState,
  credentials,
  setError,
  baseUrl,
  url,
}) => {
  try {
    setSubmissionState?.(true);
    const res = await axios(baseUrl! + url, {
      withCredentials: true,
      data: credentials,
      method: "POST",
    });
    if (res.status === 200) {
      setSubmissionState?.(false);
      setError?.(undefined);
      return res;
    }
  } catch (error) {
    setSubmissionState?.(false);
    setError?.(error as AxiosErrorWithMessage);
  }
};

interface SignoutProps
  extends Partial<Pick<ContextData, "setUser" | "baseUrl">>,
    Pick<BaseProps, "setError" | "setSubmissionState" | "url"> {}

type SignoutFn = <Response>(
  props: SignoutProps
) => Promise<AxiosResponse<Response> | undefined>;

const signout: SignoutFn = async ({
  setSubmissionState,
  setError,
  baseUrl,
  setUser,
  url,
}) => {
  try {
    setSubmissionState?.(true);
    const res = await axios(baseUrl! + url, {
      method: "DELETE",
      withCredentials: true,
    });
    if (res.status === 200) {
      setSubmissionState?.(false);
      setError?.(undefined);
      setUser?.(undefined);
      return res;
    }
  } catch (error) {
    setUser?.(undefined);
    setSubmissionState?.(false);
    setError?.(error as AxiosErrorWithMessage);
  }
};

type VerifyEmailBaseProps = BaseProps<{ code: string }> &
  Partial<Pick<ContextData, "fetchUser" | "baseUrl">>;

interface VerifyEmailPropsGet extends VerifyEmailBaseProps {
  authenticate?: never;
  method: "GET";
}

interface VerifyEmailPropsPost extends VerifyEmailBaseProps {
  authenticate: true;
  method: "PUT";
}

type VerifyEmailFn = <Response>(
  props: VerifyEmailPropsGet | VerifyEmailPropsPost
) => Promise<AxiosResponse<Response> | undefined>;

const verifyemail: VerifyEmailFn = async ({
  setSubmissionState,
  authenticate,
  credentials,
  fetchUser,
  setError,
  baseUrl,
  method,
  url,
}) => {
  var urlWithParam: string;

  if (method === "PUT") {
    urlWithParam = baseUrl! + url;
  } else {
    urlWithParam = baseUrl! + url + `/${credentials.code}`;
  }

  try {
    setSubmissionState?.(true);
    const res = await axios(urlWithParam, {
      data: { ...credentials, authenticate },
      withCredentials: true,
      method: method,
    });

    if (res.status === 200) {
      setSubmissionState?.(false);
      setError?.(undefined);

      if (authenticate) await fetchUser?.();

      return res;
    }
  } catch (error) {
    setSubmissionState?.(false);
    setError?.(error as AxiosErrorWithMessage);
  }
};

interface RequestPasswordResetProps
  extends Partial<Pick<ContextData, "baseUrl">>,
    BaseProps<{ email: string }> {}

type RequestPasswordResetFn = <Response>(
  props: RequestPasswordResetProps
) => Promise<AxiosResponse<Response> | undefined>;

const requestpasswordreset: RequestPasswordResetFn = async ({
  setSubmissionState,
  credentials,
  setError,
  baseUrl,
  url,
}) => {
  try {
    setSubmissionState?.(true);
    const res = await axios(baseUrl! + url, {
      withCredentials: true,
      data: credentials,
      method: "POST",
    });
    if (res.status === 200) {
      setSubmissionState?.(false);
      setError?.(undefined);
      return res;
    }
  } catch (error) {
    setSubmissionState?.(false);
    setError?.(error as AxiosErrorWithMessage);
  }
};

interface ResetPasswordProps
  extends Partial<Pick<ContextData, "fetchUser" | "baseUrl">>,
    BaseProps<{
      confirmPassword: string;
      password: string;
      code: string;
    }> {
  authenticate: boolean;
}

type ResetPasswordFn = <Response>(
  props: ResetPasswordProps
) => Promise<AxiosResponse<Response> | undefined>;

const resetpassword: ResetPasswordFn = async ({
  setSubmissionState,
  authenticate,
  credentials,
  fetchUser,
  setError,
  baseUrl,
  url,
}) => {
  try {
    setSubmissionState?.(true);
    const res = await axios(baseUrl! + url, {
      data: { ...credentials, authenticate },
      withCredentials: true,
      method: "POST",
    });

    if (res.status === 200) {
      setSubmissionState?.(false);
      setError?.(undefined);

      if (authenticate) await fetchUser?.();
      return res;
    }
  } catch (error) {
    setSubmissionState?.(false);
    setError?.(error as AxiosErrorWithMessage);
  }
};

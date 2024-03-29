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
   * @description url to fetch the user information from on browser reoload.
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
   * @description set the base url to be used with authentication functions everywhere.
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

export const useAuthentication = () => {
  const [submissionState, setSubmissionState] = useState(false);
  const { setUser, fetchUser, baseUrl } = useUser();
  const [error, setError] = useState<AxiosError>();

  return {
    signin: <Credentials,>(p: SignupProps<Credentials>) =>
      signin({
        setSubmissionState,
        url: "/signin",
        fetchUser,
        setError,
        baseUrl,
        ...p,
      }),

    signout: (p?: SignoutProps) =>
      signout({
        setSubmissionState,
        url: "/signout",
        setError,
        setUser,
        baseUrl,
        ...p,
      }),

    signup: <Credentials,>(p: SignupProps<Credentials>) =>
      signup({ setSubmissionState, setError, baseUrl, url: "/signup", ...p }),

    requestpasswordreset: (p: RequestPasswordResetProps) =>
      requestpasswordreset({
        url: "/requestpasswordreset",
        setSubmissionState,
        setError,
        baseUrl,
        ...p,
      }),

    resetpassword: (p: ResetPasswordProps) =>
      resetpassword({
        url: "/resetpassword",
        setSubmissionState,
        fetchUser,
        setError,
        baseUrl,
        ...p,
      }),

    /**
     * this creates a new user.This function is to be used after the signup.
     */

    verifyemail: (p: VerifyEmailProps) =>
      verifyemail({
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
  setError?: Dispatch<SetStateAction<AxiosError | undefined>>;
  setSubmissionState?: Dispatch<SetStateAction<boolean>>;
  credentials: Credentials;
  url?: string;
}

interface SigninProps<Credentials>
  extends Partial<Pick<ContextData, "fetchUser" | "baseUrl">>,
    BaseProps<Credentials> {}

type SigninFn = <Credentials>(props: SigninProps<Credentials>) => void;

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
    const { status } = await axios(baseUrl! + url, {
      withCredentials: true,
      data: credentials,
      method: "POST",
    });

    if (status === 200) {
      setSubmissionState?.(false);
      setError?.(undefined);
      await fetchUser?.();
    }
  } catch (error) {
    setSubmissionState?.(false);
    setError?.(error as AxiosError);
  }
};

interface SignupProps<Credentials>
  extends Partial<Pick<ContextData, "baseUrl">>,
    BaseProps<Credentials> {}

type SignupFn = <Credentials>(
  props: SignupProps<Credentials>
) => Promise<AxiosResponse<any, any> | undefined>;

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
    setError?.(error as AxiosError);
  }
};

interface SignoutProps
  extends Partial<Pick<ContextData, "setUser" | "baseUrl">>,
    Pick<BaseProps, "setError" | "setSubmissionState" | "url"> {}

type SignoutFn = (props: SignoutProps) => void;

const signout: SignoutFn = async ({
  setSubmissionState,
  setError,
  baseUrl,
  setUser,
  url,
}) => {
  try {
    setSubmissionState?.(true);
    const { status } = await axios(baseUrl! + url, {
      method: "DELETE",
      withCredentials: true,
    });
    if (status === 200) {
      setSubmissionState?.(false);
      setError?.(undefined);
      setUser?.(undefined);
    }
  } catch (error) {
    setSubmissionState?.(false);
    setError?.(error as AxiosError);
  }
};

interface VerifyEmailProps
  extends Partial<Pick<ContextData, "fetchUser" | "baseUrl">>,
    BaseProps<{ code: string }> {
  authenticate: boolean;
  method: "PUT" | "GET";
}

type VerifyEmailFn = (
  props: VerifyEmailProps
) => Promise<AxiosResponse<any, any>["data"] | undefined>;

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

      return res.data;
    }
  } catch (error) {
    setSubmissionState?.(false);
    setError?.(error as AxiosError);
  }
};

interface RequestPasswordResetProps
  extends Partial<Pick<ContextData, "baseUrl">>,
    BaseProps<{ email: string }> {}

type RequestPasswordResetFn = (
  props: RequestPasswordResetProps
) => Promise<AxiosResponse<any, any> | undefined>;

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
    setError?.(error as AxiosError);
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

type ResetPasswordFn = (
  props: ResetPasswordProps
) => Promise<AxiosResponse<any, any>["data"] | undefined>;

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
      return res.data;
    }
  } catch (error) {
    setSubmissionState?.(false);
    setError?.(error as AxiosError);
  }
};

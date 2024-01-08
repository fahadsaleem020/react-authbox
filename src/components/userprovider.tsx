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

const UserContext = createContext<ContextData>({
  fetchUser: () => Promise.resolve(),
  setUser: () => null,
  user: undefined,
  isloading: true,
  baseUrl: "",
});

export const useUser = () => useContext(UserContext);
export const UserProvider: FC<UserProviderProps> = ({
  baseUrl,
  onError,
  children,
  fetchUserFrom,
  refetchOnServerError = false,
}) => {
  const [user, setUser] = useState<ContextData["user"]>();
  let url = baseUrl?.trim() + fetchUserFrom.trim();
  const [isloading, setIsloading] = useState(true);

  const fetchUser = async () => {
    console.log(url);
    try {
      const { status, data } = await axios(url, {
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
        baseUrl: baseUrl?.trim(),
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
    verifyemail: (
      p: VerifyEmailPropsSignatureOne | VerifyEmailPropsSignatureSecond
    ) =>
      verifyemail({
        setSubmissionState,
        url: "/verify",
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

interface VerifyEmailPropsSignatureOne
  extends Partial<Pick<ContextData, "fetchUser" | "baseUrl">>,
    BaseProps<{ code: string }> {
  authenticate: boolean;
  method: "PUT";
}

interface VerifyEmailPropsSignatureSecond
  extends Partial<Pick<ContextData, "fetchUser" | "baseUrl">>,
    BaseProps<{ code: string; successRedirect: string }> {
  authenticate?: never;
  method: "GET";
}

type VerifyEmailFn = (
  props: VerifyEmailPropsSignatureOne | VerifyEmailPropsSignatureSecond
) => void;

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
  const urlWithParam =
    method === "PUT" ? baseUrl! + url : baseUrl! + url + "/:code";

  try {
    setSubmissionState?.(true);
    const { status } = await axios(urlWithParam, {
      withCredentials: true,
      data: credentials,
      method: method,
    });

    if (status === 200) {
      setSubmissionState?.(false);
      setError?.(undefined);
      if (authenticate) {
        await fetchUser?.();
      }
    }
  } catch (error) {
    setSubmissionState?.(false);
    setError?.(error as AxiosError);
  }
};

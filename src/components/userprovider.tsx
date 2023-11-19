import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
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
  baseUrl?: string;
  isloading: boolean;
  fetchUser: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<unknown>>;
}

interface ProviderProps extends PropsWithChildren {
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
  baseUrl?: string;
}

const UserContext = createContext<ContextData>({
  fetchUser: () => Promise.resolve(),
  setUser: () => null,
  user: undefined,
  isloading: true,
});

export const useUser = () => useContext(UserContext);
export const Provider: FC<ProviderProps> = ({
  baseUrl,
  onError,
  children,
  fetchUserFrom,
  refetchOnServerError = false,
}) => {
  const [user, setUser] = useState<ContextData["user"]>();
  const [isloading, setIsloading] = useState(true);

  const fetchUser = async () => {
    try {
      baseUrl = baseUrl ? baseUrl.trim() + fetchUserFrom.trim() : fetchUserFrom;
      const { status, data } = await axios(baseUrl, {
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
      value={{ user, setUser, isloading, fetchUser, baseUrl }}
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
    signin: (p: ISignin) =>
      signin({ ...p, setSubmissionState, fetchUser, setError, baseUrl }),
    signout: (p: ISignout) =>
      signout({ ...p, setSubmissionState, setUser, setError, baseUrl }),
    /**
     * @description handle with try catch
     * @returns axios response
     */
    log: <T,>(p: ILog) =>
      log<T>({ ...p, setSubmissionState, setError, baseUrl }),
    submissionState,
    setSubmissionState,
    error,
  };
};

interface ISignin extends Partial<Pick<ContextData, "fetchUser" | "baseUrl">> {
  setError?: Dispatch<SetStateAction<AxiosError | undefined>>;
  setSubmissionState?: Dispatch<SetStateAction<boolean>>;
  credentials: { email: string; password: string };
  url: string;
}

const signin = async ({
  setSubmissionState,
  credentials,
  fetchUser,
  setError,
  baseUrl,
  url,
}: ISignin) => {
  try {
    setSubmissionState?.(true);
    baseUrl = baseUrl ? baseUrl.trim() + url.trim() : url;
    const { status } = await axios(baseUrl, {
      method: "POST",
      withCredentials: true,
      data: credentials,
    });

    if (status === 200) {
      setSubmissionState?.(false);
      await fetchUser?.();
    }
  } catch (error) {
    setSubmissionState?.(false);
    setError?.(error as AxiosError);
  }
};

type ILog = Omit<ISignin, "setUser" | "credentials"> &
  Omit<
    {
      [P in keyof AxiosRequestConfig as `${P extends "data"
        ? "body"
        : P}`]: AxiosRequestConfig[P];
    },
    "url"
  >;

const log = async <Data,>({
  setSubmissionState,
  setError,
  baseUrl,
  url,
  ...config
}: ILog): Promise<AxiosResponse<Data> | void> => {
  try {
    baseUrl = baseUrl ? baseUrl.trim() + url.trim() : url;
    setSubmissionState?.(true);
    const res = await axios(baseUrl, {
      ...config,
    });
    if (res.status === 200) {
      setSubmissionState?.(false);
      return res;
    }
  } catch (error) {
    setSubmissionState?.(false);
    setError?.(error as AxiosError);
  }
};

interface ISignout extends Partial<Pick<ContextData, "setUser" | "baseUrl">> {
  url: string;
  setSubmissionState?: Dispatch<SetStateAction<boolean>>;
  setError?: Dispatch<SetStateAction<AxiosError | undefined>>;
}

const signout = async ({
  setSubmissionState,
  setError,
  setUser,
  baseUrl,
  url,
}: ISignout) => {
  try {
    baseUrl = baseUrl ? baseUrl.trim() + url.trim() : url;
    setSubmissionState?.(true);
    const { status } = await axios(baseUrl, {
      method: "DELETE",
      withCredentials: true,
    });
    if (status === 200) {
      setSubmissionState?.(false);
      setUser?.(undefined);
    }
  } catch (error) {
    setSubmissionState?.(false);
    setError?.(error as AxiosError);
  }
};

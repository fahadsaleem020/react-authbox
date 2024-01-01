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
  let url = baseUrl?.trim() + "/" + fetchUserFrom.trim();
  const [isloading, setIsloading] = useState(true);

  const fetchUser = async () => {
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
  const [error, setError] = useState<AxiosError>();
  const { setUser, fetchUser, baseUrl } = useUser();

  return {
    signin: <Credentials,>(p: SigninProps<Credentials>) =>
      signin({ ...p, setSubmissionState, fetchUser, setError, baseUrl }),
    signout: (p: SignoutProps) =>
      signout({ ...p, setSubmissionState, setUser, setError, baseUrl }),
    /**
     * @description handle with try catch
     * @returns axios response
     */
    signup: <Credentials,>(p: SignupProps<Credentials>) =>
      signup({ ...p, setSubmissionState, setError, baseUrl }),
    submissionState,
    setSubmissionState,
    error,
  };
};

interface BaseProps<Credentials> {
  setError?: Dispatch<SetStateAction<AxiosError | undefined>>;
  setSubmissionState?: Dispatch<SetStateAction<boolean>>;
  credentials: Credentials;
  url: string;
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
    const { status } = await axios(baseUrl + url, {
      withCredentials: true,
      data: credentials,
      method: "POST",
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
    const res = await axios(baseUrl + url, {
      withCredentials: true,
      data: credentials,
      method: "POST",
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

interface SignoutProps
  extends Partial<Pick<ContextData, "setUser" | "baseUrl">> {
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
}: SignoutProps) => {
  try {
    setSubmissionState?.(true);
    const { status } = await axios(baseUrl + url, {
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

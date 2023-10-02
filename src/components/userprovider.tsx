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

type ContextData = {
  user?: any;
  isloading: boolean;
  fetchUser: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<ContextData["user"]>>;
};

const UserContext = createContext<ContextData>({
  isloading: true,
  setUser: () => null,
  user: undefined,
  fetchUser: () => Promise.resolve(),
});

export const useUser = () => useContext(UserContext);

const Provider: FC<
  PropsWithChildren & {
    /**
     * @type string
     * @description url to fetch the user information from
     */
    fetchUserUrl: string;
    /**
     * @type boolean
     * @description continiously refetch from fetchUserUrl if it fails to get user info
     */
    refetchOnServerError?: boolean;
    /**
     * @type callback
     * @param error AxioxError
     * @returns void
     * @description contains error info if the fetchUserUrl fails to get user info
     */
    fetchError?: (error: AxiosError) => void;
  }
> = ({ children, fetchUserUrl, refetchOnServerError = false, fetchError }) => {
  const [user, setUser] = useState<ContextData["user"]>();
  const [isloading, setIsloading] = useState(true);

  const fetchUser = async () => {
    try {
      const { status, data } = await axios(fetchUserUrl, {
        withCredentials: true,
      });
      if (status === 200) {
        setUser(data);
      }
      setIsloading(false);
    } catch (error) {
      setIsloading(false);
      const { code } = error as AxiosError;
      fetchError?.(error as AxiosError);
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
    <UserContext.Provider value={{ user, setUser, isloading, fetchUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useAuthentication = () => {
  const [submissionState, setSubmissionState] = useState(false);
  const [error, setError] = useState<AxiosError>();
  const { setUser, fetchUser } = useUser();

  return {
    signin: (p: ISignin) =>
      signin({ ...p, setSubmissionState, fetchUser, setError }),
    signout: (p: ISignout) =>
      signout({ ...p, setSubmissionState, setUser, setError }),
    /**
     * @description handle with try catch
     * @returns axios response
     */
    log: <T,>(p: ILog) => log<T>({ ...p, setSubmissionState, setError }),
    submissionState,
    setSubmissionState,
    error,
  };
};

interface ISignin extends Partial<Pick<ContextData, "fetchUser">> {
  credentials: any;
  url: string;
  setSubmissionState?: Dispatch<SetStateAction<boolean>>;
  setError?: Dispatch<SetStateAction<AxiosError | undefined>>;
}

const signin = async ({
  credentials,
  setSubmissionState,
  url,
  fetchUser,
  setError,
}: ISignin) => {
  try {
    setSubmissionState?.(true);
    const { status } = await axios(url, {
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
  Omit<AxiosRequestConfig, "url">;

const log = async <Data = any,>({
  setSubmissionState,
  setError,
  url,
  ...config
}: ILog): Promise<AxiosResponse<Data> | void> => {
  try {
    setSubmissionState?.(true);
    const res = await axios(url, {
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

interface ISignout extends Partial<Pick<ContextData, "setUser">> {
  url: string;
  setSubmissionState?: Dispatch<SetStateAction<boolean>>;
  setError?: Dispatch<SetStateAction<AxiosError | undefined>>;
}

const signout = async ({
  url,
  setSubmissionState,
  setUser,
  setError,
}: ISignout) => {
  try {
    setSubmissionState?.(true);
    const { status } = await axios(url, {
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

export default Provider;

import { useAuthentication } from "./components/userprovider";
import { Offline } from "@/components/offline";
import { Online } from "@/components/online";

function App() {
  const { submissionState, signout, requestpasswordreset, resetpassword } =
    useAuthentication();

  const requestPasswordResetHandler = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const credentials = Object.fromEntries(new FormData(e.currentTarget));

    const email = credentials.email as string;
    const res = await requestpasswordreset({
      credentials: { email },
    });
    console.log(res);
  };
  const resetPasswordHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const credentials = Object.fromEntries(new FormData(e.currentTarget)) as {
      code: string;
      password: string;
      confirmPassword: string;
    };

    await resetpassword({
      authenticate: true,
      credentials,
    });
  };

  return (
    <>
      <Offline>
        <form onSubmit={requestPasswordResetHandler}>
          <input type="text" name="email" placeholder="email" />
          <button type="submit" disabled={submissionState}>
            request password reset
          </button>
        </form>
        <br />
        <form onSubmit={resetPasswordHandler}>
          <input type="text" name="password" placeholder="password" />
          <input
            type="text"
            name="confirmPassword"
            placeholder="confirm password"
          />
          <input type="text" name="code" placeholder="code" />
          <button type="submit" disabled={submissionState}>
            request password reset
          </button>
        </form>
      </Offline>
      <Online>
        online
        <button type="button" onClick={() => signout()}>
          logout
        </button>
      </Online>
    </>
  );
}

export default App;

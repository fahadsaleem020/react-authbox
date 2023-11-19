import { Offline } from "@/components/offline";
import { Online } from "@/components/online";
import { useAuthentication } from "./components/userprovider";

function App() {
  const { signin, submissionState, signout } = useAuthentication();
  const handler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const credentials = Object.fromEntries(new FormData(e.currentTarget));
    await signin({
      credentials: credentials as { email: string; password: string },
      url: "login",
    });
  };
  return (
    <>
      <Offline>
        <form onSubmit={handler}>
          <input type="text" name="email" placeholder="email" />
          <input type="password" name="password" placeholder="password" />
          <button type="submit" disabled={submissionState}>
            login
          </button>
        </form>
      </Offline>
      <Online>
        online
        <button type="button" onClick={() => signout({ url: "logout" })}>
          logout
        </button>
      </Online>
    </>
  );
}

export default App;

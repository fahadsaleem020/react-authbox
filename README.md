# react-authbox

A lightweight, TypeScript-based React library for managing session-based authentication flows. `react-authbox` abstracts complex authentication logic into a unified API, enabling developers to integrate secure session-based authentication with minimal boilerplate.

## Features

- 🔐 **Centralized State Management**: Robust `UserProvider` context that handles user sessions, loading states, and global error handling.
- 🎣 **Comprehensive Auth Hook**: `useAuthentication` handles Sign In, Sign Up, Sign Out, Password Reset, and Email Verification.
- 👁️ **Declarative UI Control**: `<Online>` and `<Offline>` components to conditionally render UI based on auth status.
- 🚀 **Production Ready**: Built with TypeScript and Axios, featuring environment-specific API configurations.

## Installation

```bash
npm install react-authbox axios
# or
yarn add react-authbox axios
```

> **Note**: `axios` is a peer dependency and must be installed in your project.

## Quick Start

### 1. Setup the Provider

Wrap your application with `UserProvider` to initialize the authentication context. You need to provide the base URL for your API (handling both development and production environments) and the endpoint to fetch the current user.

```tsx
import { UserProvider } from 'react-authbox';
import App from './App';

const Main = () => (
  <UserProvider
    baseUrl={{
      development: "http://localhost:3000",
      production: "https://api.your-production-url.com"
    }}
    fetchUserFrom="/users/me" // Endpoint to fetch current user session
    refetchOnServerError={false} // Optional: Retry on network errors
    onError={(error) => console.error("Global Auth Error:", error)}
  >
    <App />
  </UserProvider>
);

export default Main;
```

### 2. Using Authentication Hooks

Use the `useAuthentication` hook to handle login, signup, and other actions.

```tsx
import { useAuthentication } from 'react-authbox';
import { useState } from 'react';

const LoginForm = () => {
  const { signin, submissionState, error } = useAuthentication();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    signin({
      credentials: { email, password },
      onSuccess: (response) => {
        console.log("Logged in successfully!", response);
      },
      onError: (err) => {
        console.error("Login failed", err);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
        placeholder="Email" 
      />
      <input 
        type="password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
        placeholder="Password" 
      />
      
      <button disabled={submissionState}>
        {submissionState ? 'Logging in...' : 'Login'}
      </button>

      {error && <p style={{ color: 'red' }}>{error.message}</p>}
    </form>
  );
};
```

### 3. Conditional Rendering (Online/Offline)

Control what users see based on their authentication state using `<Online>` and `<Offline>` components.

```tsx
import { Online, Offline, useUser } from 'react-authbox';

const Dashboard = () => {
  return (
    <>
      <Online fallback={<div>Loading user data...</div>}>
        {(user) => (
          <div>
            <h1>Welcome back, {user.name}!</h1>
            <button>Go to Dashboard</button>
          </div>
        )}
      </Online>

      <Offline>
        <div>
          <h1>Please Log In</h1>
          <p>You need to be authenticated to view this content.</p>
        </div>
      </Offline>
    </>
  );
};
```

## API Reference

### `UserProvider Props`

| Prop | Type | Description |
|------|------|-------------|
| `baseUrl` | `{ development: string; production: string }` | **Required**. Base URL for your backend API. |
| `fetchUserFrom` | `string` | **Required**. Endpoint path to fetch the current user (e.g., `/user` or `/me`). |
| `refetchOnServerError` | `boolean` | Continuously refetch if the server returns a network error. Default: `false`. |
| `onError` | `(error: AxiosError) => void` | Global error handler for authentication errors. |

### `useAuthentication` Return Values

| Method/Value | Description |
|--------------|-------------|
| `signin(props)` | Function to handle user login. |
| `signup(props)` | Function to register a new user. |
| `signout(props)` | Function to log the user out. |
| `requestpasswordreset(props)` | Trigger password reset flow. |
| `resetpassword(props)` | Complete password reset with token. |
| `verifyemail(props)` | Verify user email address. |
| `submissionState` | `boolean` indicating if a request is in progress. |
| `error` | Holds the last `AxiosError` encountered. |

### `Online` & `Offline` Props

| Prop | Type | Description |
|------|------|-------------|
| `children` | `ReactNode` \| `(user) => ReactNode` | Content to render when the condition is met. |
| `fallback` | `ReactNode` | Content to show while loading/checking auth state. |
| `offline` (on `<Online>`) | `ReactNode` | Optional content to show if the user is offline (alternative to using `<Offline>`). |
| `online` (on `<Offline>`) | `ReactNode` | Optional content to show if the user is online. |

## License

MIT © [fahadsaleem020](https://github.com/fahadsaleem020)

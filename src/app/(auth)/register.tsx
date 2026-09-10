import { Redirect } from "expo-router";

/**
 * Sign In / Sign Up is now an in-place animated switch on the /login screen.
 * This route is kept so existing links and deep links to /register still land
 * on the Sign Up panel.
 */
export default function RegisterRedirect() {
  return <Redirect href={{ pathname: "/login", params: { mode: "signup" } }} />;
}

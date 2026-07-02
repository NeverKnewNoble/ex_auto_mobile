/**
 * Auth shapes. The mobile app logs in with username/password; the backend
 * verifies, ensures the user has an API key/secret (generating them if missing),
 * and returns the token pair + user details. The app then sends
 * `Authorization: token <api_key>:<api_secret>` on every call.
 */

export interface LoginCredentials {
  usr: string;
  pwd: string;
}

export interface AuthUser {
  name: string; // Frappe user id (usually email)
  full_name: string;
  email: string;
  user_image?: string;
  roles?: string[];
  /** Workshop context, if the backend includes it. */
  branch?: string;
  technician?: string;
  technician_name?: string;
}

/**
 * Response from ex_auto.api.auth.login (already unwrapped from `message`).
 * On bad credentials the endpoint returns `success: false` with a message.
 * User details may arrive nested under `user` or flattened — handled in the
 * service.
 */
export interface LoginResult {
  success: boolean;
  api_key?: string;
  api_secret?: string;
  message?: string;
  user?: AuthUser;
  // flattened fallbacks
  name?: string;
  full_name?: string;
  email?: string;
  roles?: string[];
}

/** What we persist on the device (token pair + user). */
export interface Session {
  apiKey: string;
  apiSecret: string;
  user: AuthUser;
}

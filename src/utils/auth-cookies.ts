import Cookies from 'js-cookie';

const COOKIE_NAMES = {
  CLIENT_ID: 'api-client-id',
  CLIENT_SECRET: 'api-client-secret',
} as const;

// Allow cookies to be set over HTTP during local development (e.g., when accessed via local IP)
const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';

const COOKIE_OPTIONS = {
  expires: 30, // 30 days
  secure: isHttps,
  sameSite: 'lax' as const,
};

export const authCookies = {
  setCredentials: (clientId: string, clientSecret: string) => {
    Cookies.set(COOKIE_NAMES.CLIENT_ID, clientId, COOKIE_OPTIONS);
    Cookies.set(COOKIE_NAMES.CLIENT_SECRET, clientSecret, COOKIE_OPTIONS);
  },

  getCredentials: () => {
    const clientId = Cookies.get(COOKIE_NAMES.CLIENT_ID);
    const clientSecret = Cookies.get(COOKIE_NAMES.CLIENT_SECRET);
    return { clientId, clientSecret };
  },

  hasCredentials: () => {
    const { clientId, clientSecret } = authCookies.getCredentials();
    return !!(clientId && clientSecret);
  },

  clearCredentials: () => {
    Cookies.remove(COOKIE_NAMES.CLIENT_ID);
    Cookies.remove(COOKIE_NAMES.CLIENT_SECRET);
  },
};
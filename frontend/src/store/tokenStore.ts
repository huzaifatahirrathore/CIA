let _accessToken: string | null = null;
let _onUnauthenticated: (() => void) | null = null;

export const tokenStore = {
  get: (): string | null => _accessToken,
  set: (token: string): void => { _accessToken = token; },
  clear: (): void => { _accessToken = null; },
  registerUnauthenticatedHandler: (cb: () => void): void => { _onUnauthenticated = cb; },
  triggerUnauthenticated: (): void => { _onUnauthenticated?.(); },
};

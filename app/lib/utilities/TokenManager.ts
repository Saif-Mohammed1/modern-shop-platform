class TokenManager {
  private access_token: string | null;
  private logOut: boolean;
  constructor() {
    this.access_token = null;
    this.logOut = false;
  }

  setAccessToken(token: string): void {
    this.access_token = token;
  }

  getAccessToken(): string | null {
    return this.access_token;
  }

  clearAccessToken(): void {
    this.access_token = null;
  }
  setLogOut(logOut: boolean): void {
    this.logOut = logOut;
  }
  getLogOut(): boolean {
    return this.logOut;
  }
}

const tokenManager = new TokenManager();
export default tokenManager;

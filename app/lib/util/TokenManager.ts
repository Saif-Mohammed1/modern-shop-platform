class TokenManager {
  private accessToken: string | null;

  constructor() {
    this.accessToken = null;
  }

  setAccessToken(token: string): void {
    this.accessToken = token;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  clearAccessToken(): void {
    this.accessToken = null;
  }
}

const tokenManager = new TokenManager();
export default tokenManager;

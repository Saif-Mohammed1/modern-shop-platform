class TokenManager {
  private access_token: string | null;

  constructor() {
    this.access_token = null;
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
}

const tokenManager = new TokenManager();
export default tokenManager;

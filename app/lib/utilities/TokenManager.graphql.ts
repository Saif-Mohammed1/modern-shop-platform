import type AppError from "./appError";

// lib/utilities/TokenManager.ts
export default class TokenManager {
  private accessToken: string | null = null;
  private _isRefreshing = false;
  private _isLoggedOut = false;
  private refreshSubscribers: Array<{
    resolve: (token: string) => void;
    reject: (error: AppError) => void;
  }> = [];

  getAccessToken() {
    return this.accessToken;
  }

  setAccessToken(token: string) {
    this.accessToken = token;
  }

  clearAccessToken() {
    this.accessToken = null;
  }

  setRefreshing(status: boolean) {
    this._isRefreshing = status;
  }

  isRefreshing() {
    return this._isRefreshing;
  }

  addRefreshSubscriber(subscriber: {
    resolve: (token: string) => void;
    reject: (error: AppError) => void;
  }) {
    this.refreshSubscribers.push(subscriber);
  }

  clearRefreshSubscribers() {
    this.refreshSubscribers = [];
  }

  notifyRefreshSubscribers(token: string) {
    this.refreshSubscribers.forEach((sub) => sub.resolve(token));
  }

  rejectRefreshSubscribers(error: AppError) {
    this.refreshSubscribers.forEach((sub) => sub.reject(error));
  }

  setLogOut(status: boolean) {
    this._isLoggedOut = status;
  }

  isLoggedOut() {
    return this._isLoggedOut;
  }
}

// Create and export a singleton instance
const tokenManager = new TokenManager();
export { tokenManager };

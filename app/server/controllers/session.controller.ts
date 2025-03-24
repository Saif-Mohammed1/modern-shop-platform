import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SessionService } from "../services/session.service";
import AppError from "@/app/lib/utilities/appError";
import { refreshTokenControllerTranslate } from "@/public/locales/server/refreshTokenControllerTranslate";
import { lang } from "@/app/lib/utilities/lang";
import { TokensService } from "../services/tokens.service";
import { ReviewTranslate } from "@/public/locales/server/Review.Translate";

class SessionController {
  constructor(
    private readonly sessionService: SessionService = new SessionService(),
    private readonly tokenService: TokensService = new TokensService()
  ) {}
  async refreshAccessToken(req: NextRequest) {
    try {
      const refreshToken =
        (await cookies())?.get("refreshAccessToken")?.value ||
        req?.cookies?.get("refreshAccessToken")?.value;

      if (!refreshToken)
        throw new AppError(
          refreshTokenControllerTranslate[
            lang
          ].functions.refreshAccessToken.requiredFields,
          401
        );
      const decoded = await this.tokenService.decodedRefreshToken(refreshToken);
      // Check database validity
      const isValid = await this.sessionService.validateRefreshToken(
        decoded?.userId,
        refreshToken
      );
      if (!isValid) {
        throw new AppError(
          refreshTokenControllerTranslate[
            lang
          ].functions.verifyRefreshToken.invalidRefreshToken,
          401
        );
      }
      const accessToken = this.tokenService.createAccessToken(decoded.userId);
      return NextResponse.json({ accessToken }, { status: 200 });
    } catch (error) {
      throw error;
    }
  }
  async revokeAllUserTokens(req: NextRequest) {
    try {
      await this.sessionService.revokeAllSessions(String(req.user?._id));
      return NextResponse.json(
        { message: "All sessions revoked successfully" },
        { status: 200 }
      );
    } catch (error) {
      throw error;
    }
  }
  async revokeSession(req: NextRequest) {
    try {
      if (!req.id)
        throw new AppError(ReviewTranslate[lang].errors.noDocumentsFound, 404);
      await this.sessionService.revokeSession(req?.id);
      return NextResponse.json(
        { message: "Session revoked successfully" },
        { status: 200 }
      );
    } catch (error) {
      throw error;
    }
  }
}

export default new SessionController();

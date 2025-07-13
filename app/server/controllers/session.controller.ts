import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

import AppError from "@/app/lib/utilities/appError";
import { lang } from "@/app/lib/utilities/lang";
import { refreshTokenControllerTranslate } from "@/public/locales/server/refreshTokenControllerTranslate";
import { ReviewTranslate } from "@/public/locales/server/Review.Translate";

import { SessionService } from "../services/session.service";
import { TokensService } from "../services/tokens.service";

class SessionController {
  constructor(
    private readonly sessionService: SessionService = new SessionService(),
    private readonly tokenService: TokensService = new TokensService()
  ) {}
  async refreshAccessToken(req: NextRequest) {
    const refreshToken =
      (await cookies())?.get("refreshAccessToken")?.value ||
      req?.cookies?.get("refreshAccessToken")?.value;
    if (!refreshToken) {
      throw new AppError(
        refreshTokenControllerTranslate[
          lang
        ].functions.refreshAccessToken.requiredFields,
        401
      );
    }
    const decoded = await this.tokenService.decodedRefreshToken(refreshToken);
    // Check database validity
    const isValid = await this.sessionService.validateRefreshToken(
      decoded?.user_id,
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
    const access_token = this.tokenService.createAccessToken(decoded.user_id);
    return NextResponse.json({ access_token }, { status: 200 });
  }
  async revokeAllUserTokens(req: NextRequest) {
    await this.sessionService.revokeAllSessions(String(req.user?._id));
    return NextResponse.json(
      { message: "All sessions revoked successfully" },
      { status: 200 }
    );
  }
  async revokeSession(req: NextRequest) {
    if (!req.id) {
      throw new AppError(ReviewTranslate[lang].errors.noDocumentsFound, 404);
    }
    await this.sessionService.revokeSession(req?.id);
    return NextResponse.json(
      { message: "Session revoked successfully" },
      { status: 200 }
    );
  }
}

export default new SessionController();

import { cookies } from "next/headers";

import AppError from "@/app/lib/utilities/appError";
import { lang } from "@/app/lib/utilities/lang";
import { refreshTokenControllerTranslate } from "@/public/locales/server/refreshTokenControllerTranslate";

import { AuthMiddleware } from "../../middlewares/auth.middleware";
import { SessionService } from "../../services/session.service";
import { TokensService } from "../../services/tokens.service";
import type { Context } from "../apollo-server";

const sessionService = new SessionService();
const tokenService = new TokensService();
export const sessionsResolvers = {
  Mutation: {
    refreshAccessToken: async (
      _parent: unknown,
      _args: unknown,
      { req }: Context
    ) => {
      const cookiesStore = await cookies();
      const refreshToken =
        cookiesStore?.get("refreshAccessToken")?.value ||
        req?.cookies?.get("refreshAccessToken")?.value;
      if (!refreshToken) {
        throw new AppError(
          refreshTokenControllerTranslate[
            lang
          ].functions.refreshAccessToken.requiredFields,
          401
        );
      }
      const decoded = await tokenService.decodedRefreshToken(refreshToken);
      // Check database validity
      const isValid = await sessionService.validateRefreshToken(
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
      const access_token = tokenService.createAccessToken(decoded.user_id);
      return { access_token };
    },
    revokeAllUserTokens: async (
      _parent: unknown,
      _args: unknown,
      { req }: Context
    ) => {
      await AuthMiddleware.requireAuth([])(req);
      await sessionService.revokeAllSessions(String(req.user?._id));
      return {
        message:
          refreshTokenControllerTranslate[lang].functions.revokeAllUserTokens
            .message,
      };
    },
    revokeSession: async (
      _parent: unknown,
      { id }: { id: string },
      { req }: Context
    ) => {
      await AuthMiddleware.requireAuth([])(req);
      await sessionService.revokeSession(id);
      return {
        message:
          refreshTokenControllerTranslate[lang].functions.revokeSession.message,
      };
    },
  },
};

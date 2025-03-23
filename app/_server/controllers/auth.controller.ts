import { NextRequest, NextResponse } from "next/server";
import { UserValidation } from "../dtos/user.dto";
import { UserService } from "../services/user.service";
import { getDeviceFingerprint } from "@/app/lib/utilities/DeviceFingerprint.utility";
import { AuthTranslate } from "@/public/locales/server/Auth.Translate";
import { lang } from "@/app/lib/utilities/lang";
import AppError from "@/app/lib/utilities/appError";

class AuthController {
  constructor(private readonly userService: UserService = new UserService()) {}
  async register(req: NextRequest) {
    try {
      const body = await req.json();
      const userData = UserValidation.validateUserCreateDTO(body);
      const deviceInfo = await getDeviceFingerprint(req);
      const user = await this.userService.registerUser(userData, deviceInfo);

      return NextResponse.json(user, { status: 201 });
    } catch (error) {
      throw error;
    }
  }

  async login(req: NextRequest) {
    try {
      const body = await req.json();

      const result = UserValidation.validateLogin(body);
      const deviceInfo = await getDeviceFingerprint(req);

      const authResult = await this.userService.authenticateUser(
        result.email,
        result.password,
        deviceInfo
      );
      if ("requires2FA" in authResult) {
        return NextResponse.json(
          {
            requires2FA: true,
            tempToken: authResult.tempToken,
            expires: authResult.expires,
            message: authResult.message,
          },
          { status: 202 }
        );
      }
      // Generate JWT token
      // res.json({ user, token: generateToken(user) });
      return NextResponse.json({ ...authResult }, { status: 200 });
    } catch (error) {
      throw error;
    }
  }
  async logout(_req: NextRequest) {
    try {
      // const deviceInfo = await getDeviceFingerprint(req);
      await this.userService.logOut();
      // await this.userService.logOut(req.user?._id, deviceInfo);
      return NextResponse.json(
        { message: AuthTranslate[lang].auth.logOut.logOutSuccess },
        { status: 200 }
      );
    } catch (error) {
      throw error;
    }
  }
  async forgotPassword(req: NextRequest) {
    try {
      const { email } = await req.json();
      const result = UserValidation.isEmailValid(email);
      const deviceInfo = await getDeviceFingerprint(req);

      await this.userService.requestPasswordReset(result, deviceInfo);
      return NextResponse.json(
        {
          message:
            AuthTranslate[lang].auth.forgotPassword.passwordResetLinkSent,
        },
        { status: 200 }
      );
    } catch (error) {
      throw error;
    }
  }
  async isEmailAndTokenValid(req: NextRequest) {
    try {
      const params = new URLSearchParams(req.nextUrl.searchParams);
      const token = params.get("token") || undefined;
      const email = params.get("email") || undefined;
      const result = UserValidation.validateEmailAndToken({ token, email });
      await this.userService.validateEmailAndToken(result.token, result.email);
      return NextResponse.json(
        { message: AuthTranslate[lang].auth.isEmailAndTokenValid.tokenIsValid },
        { status: 200 }
      );
    } catch (error) {
      throw error;
    }
  }
  async resetPassword(req: NextRequest) {
    try {
      // const params = new URLSearchParams(req.nextUrl.searchParams);

      // const token = params.get("token") || undefined;
      // const email = params.get("email") || undefined;
      const body = await req.json();
      const deviceInfo = await getDeviceFingerprint(req);
      const result = UserValidation.validatePasswordReset(body);

      await this.userService.validatePasswordResetToken(
        result.token,
        result.email,
        result.password,
        deviceInfo
      );
      return NextResponse.json(
        {
          message: AuthTranslate[lang].auth.resetPassword.passwordResetSuccess,
        },
        { status: 200 }
      );
    } catch (error) {
      throw error;
    }
  }
  async requestEmailChange(req: NextRequest) {
    try {
      if (!req.user?._id) {
        throw new AppError(AuthTranslate[lang].errors.userNotFound, 404);
      }
      const body = await req.json();
      const email = UserValidation.isEmailValid(body.email);
      const deviceInfo = await getDeviceFingerprint(req);
      await this.userService.requestEmailChange(
        req.user?._id.toString(),
        email,
        deviceInfo
      );
      return NextResponse.json(
        {
          message: AuthTranslate[lang].auth.requestEmailChange.confirmation,
        },
        { status: 200 }
      );
    } catch (error) {
      throw error;
    }
  }
  async confirmEmailChange(req: NextRequest) {
    try {
      const searchParams = new URLSearchParams(req.nextUrl.searchParams);
      const token = searchParams.get("token") || undefined;
      const result = UserValidation.validateEmailAndToken({
        token,
        email: req.user?.email,
      });
      await this.userService.confirmEmailChange(result.token);
      return NextResponse.json(
        {
          message:
            AuthTranslate[lang].auth.confirmEmailChange.emailChangeSuccess,
        },
        { status: 200 }
      );
    } catch (error) {
      throw error;
    }
  }
  async verifyEmail(req: NextRequest) {
    try {
      if (!req.user?._id) {
        throw new AppError(AuthTranslate[lang].errors.userNotFound, 404);
      }
      const body = await req.json();
      const code = UserValidation.isVerificationCodeValid(body.code);
      await this.userService.verifyEmail(req.user?._id.toString(), code);
      return NextResponse.json(
        {
          message: AuthTranslate[lang].auth.verifyEmail.emailVerified,
        },
        { status: 200 }
      );
    } catch (error) {
      throw error;
    }
  }
  // async verifyEmail(req: NextRequest) {
  //   try {
  //     const body = await req.json();
  //     const code = UserValidation.isVerificationCodeValid(body.code);
  //     await this.userService.verifyEmail(req.user?._id, code);
  //     return NextResponse.json(
  //       {
  //         message: AuthTranslate[lang].auth.verifyEmail.emailVerified,
  //       },
  //       { status: 200 }
  //     );
  //   } catch (error) {
  //     throw error;
  //   }
  // }
  async sendNewVerificationCode(req: NextRequest) {
    try {
      if (!req.user?._id) {
        throw new AppError(AuthTranslate[lang].errors.userNotFound, 404);
      }
      await this.userService.sendVerificationCode(req.user?._id.toString());
      return NextResponse.json(
        {
          message: AuthTranslate[lang].auth.sendNewVerificationCode.success,
        },
        { status: 200 }
      );
    } catch (error) {
      throw error;
    }
  }
  async updateName(req: NextRequest) {
    try {
      if (!req.user?._id) {
        throw new AppError(AuthTranslate[lang].errors.userNotFound, 404);
      }
      const body = await req.json();
      const result = UserValidation.validateName(body.name);
      await this.userService.updateName(req.user?._id.toString(), result);
      return NextResponse.json(
        {
          message: AuthTranslate[lang].auth.updateName.success,
        },
        { status: 200 }
      );
    } catch (error) {
      throw error;
    }
  }
  async updateLoginNotificationSent(req: NextRequest) {
    try {
      if (!req.user?._id) {
        throw new AppError(AuthTranslate[lang].errors.userNotFound, 404);
      }
      const body = await req.json();
      const result = UserValidation.validateLoginNotificationSent(
        body.loginNotificationSent
      );
      await this.userService.updateLoginNotificationSent(
        req.user?._id.toString(),
        result
      );
      return NextResponse.json(
        {
          message: AuthTranslate[lang].auth.updateLoginNotificationSent.success,
        },
        { status: 200 }
      );
    } catch (error) {
      throw error;
    }
  }

  async getActiveSessions(req: NextRequest) {
    try {
      if (!req.user?._id) {
        throw new AppError(AuthTranslate[lang].errors.userNotFound, 404);
      }
      const sessions = await this.userService.getActiveSessions(
        req.user?._id.toString()
      );
      return NextResponse.json(sessions, { status: 200 });
    } catch (error) {
      throw error;
    }
  }
}
export default new AuthController();

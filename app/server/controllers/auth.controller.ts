import { type NextRequest, NextResponse } from "next/server";

import AppError from "@/app/lib/utilities/appError";
import { getDeviceFingerprint } from "@/app/lib/utilities/DeviceFingerprint.utility";
import { lang } from "@/app/lib/utilities/lang";
import { AuthTranslate } from "@/public/locales/server/Auth.Translate";

import { UserValidation } from "../dtos/user.dto";
import { UserService } from "../services/user.service";

class AuthController {
  constructor(private readonly userService: UserService = new UserService()) {}
  async register(req: NextRequest) {
    const body = await req.json();
    const userData = UserValidation.validateUserCreateDTO(body);
    const device_info = await getDeviceFingerprint(req);
    const user = await this.userService.registerUser(userData, device_info);

    return NextResponse.json(user, { status: 201 });
  }

  async login(req: NextRequest) {
    const body = await req.json();

    const result = UserValidation.validateLogin(body);
    const device_info = await getDeviceFingerprint(req);

    const authResult = await this.userService.authenticateUser(
      result.email,
      result.password,
      device_info
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
  }
  async logout(_req: NextRequest) {
    // const device_info = await getDeviceFingerprint(req);
    await this.userService.logOut();
    // await this.userService.logOut(req.user?._id, device_info);
    return NextResponse.json(
      { message: AuthTranslate[lang].auth.logOut.logOutSuccess },
      { status: 200 }
    );
  }
  async forgotPassword(req: NextRequest) {
    const { email } = await req.json();
    const result = UserValidation.isEmailValid(email);
    const device_info = await getDeviceFingerprint(req);

    await this.userService.requestPasswordReset(result, device_info);
    return NextResponse.json(
      {
        message: AuthTranslate[lang].auth.forgotPassword.passwordResetLinkSent,
      },
      { status: 200 }
    );
  }
  async isEmailAndTokenValid(req: NextRequest) {
    const params = new URLSearchParams(req.nextUrl.searchParams);
    const token = params.get("token") || undefined;
    const email = params.get("email") || undefined;
    const result = UserValidation.validateEmailAndToken({ token, email });
    await this.userService.validateEmailAndToken(result.token, result.email);
    return NextResponse.json(
      { message: AuthTranslate[lang].auth.isEmailAndTokenValid.tokenIsValid },
      { status: 200 }
    );
  }
  async resetPassword(req: NextRequest) {
    // const params = new URLSearchParams(req.nextUrl.searchParams);

    // const token = params.get("token") || undefined;
    // const email = params.get("email") || undefined;
    const body = await req.json();
    const device_info = await getDeviceFingerprint(req);
    const result = UserValidation.validatePasswordReset(body);

    await this.userService.validatePasswordResetToken(
      result.token,
      // result.email,
      result.password,
      device_info
    );
    return NextResponse.json(
      {
        message: AuthTranslate[lang].auth.resetPassword.passwordResetSuccess,
      },
      { status: 200 }
    );
  }
  async requestEmailChange(req: NextRequest) {
    if (!req.user?._id) {
      throw new AppError(AuthTranslate[lang].errors.userNotFound, 404);
    }
    const { email } = await req.json();
    const emailValid = UserValidation.isEmailValid(email);
    const device_info = await getDeviceFingerprint(req);
    await this.userService.requestEmailChange(
      req.user?._id.toString(),
      emailValid,
      device_info
    );
    return NextResponse.json(
      {
        message: AuthTranslate[lang].auth.requestEmailChange.confirmation,
      },
      { status: 200 }
    );
  }
  async confirmEmailChange(req: NextRequest) {
    const searchParams = new URLSearchParams(req.nextUrl.searchParams);
    const token = searchParams.get("token") || undefined;
    const result = UserValidation.validateEmailAndToken({
      token,
      email: req.user?.email,
    });
    const device_info = await getDeviceFingerprint(req);
    await this.userService.confirmEmailChange(result.token, device_info);
    return NextResponse.json(
      {
        message: AuthTranslate[lang].auth.confirmEmailChange.emailChangeSuccess,
      },
      { status: 200 }
    );
  }
  async verifyEmail(req: NextRequest) {
    if (!req.user?._id) {
      throw new AppError(AuthTranslate[lang].errors.userNotFound, 404);
    }
    const { code } = await req.json();
    const result = UserValidation.isVerificationCodeValid(code);
    const device_info = await getDeviceFingerprint(req);
    await this.userService.verifyEmail(
      req.user?._id.toString(),
      result,
      device_info
    );
    return NextResponse.json(
      {
        message: AuthTranslate[lang].auth.verifyEmail.email_verified,
      },
      { status: 200 }
    );
  }
  // async verifyEmail(req: NextRequest) {
  //
  //     const body = await req.json();
  //     const code = UserValidation.isVerificationCodeValid(body.code);
  //     await this.userService.verifyEmail(req.user?._id, code);
  //     return NextResponse.json(
  //       {
  //         message: AuthTranslate[lang].auth.verifyEmail.email_verified,
  //       },
  //       { status: 200 }
  //     );
  //   } catch (error) {
  //     throw error;
  //   }
  // }
  async sendNewVerificationCode(req: NextRequest) {
    if (!req.user?._id) {
      throw new AppError(AuthTranslate[lang].errors.userNotFound, 404);
    }
    const device_info = await getDeviceFingerprint(req);
    await this.userService.sendVerificationCode(
      req.user?._id.toString(),
      device_info
    );
    return NextResponse.json(
      {
        message: AuthTranslate[lang].auth.sendNewVerificationCode.success,
      },
      { status: 200 }
    );
  }
  async updateName(req: NextRequest) {
    if (!req.user?._id) {
      throw new AppError(AuthTranslate[lang].errors.userNotFound, 404);
    }
    const { name } = await req.json();
    const result = UserValidation.validateName(name);
    await this.userService.updateName(req.user?._id.toString(), result);
    return NextResponse.json(
      {
        message: AuthTranslate[lang].auth.updateName.success,
      },
      { status: 200 }
    );
  }
  async updateLoginNotificationSent(req: NextRequest) {
    if (!req.user?._id) {
      throw new AppError(AuthTranslate[lang].errors.userNotFound, 404);
    }
    const { login_notification_sent } = await req.json();
    const result = UserValidation.validateLoginNotificationSent(
      login_notification_sent
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
  }

  async getActiveSessions(req: NextRequest) {
    if (!req.user?._id) {
      throw new AppError(AuthTranslate[lang].errors.userNotFound, 404);
    }
    const sessions = await this.userService.getActiveSessions(
      req.user?._id.toString()
    );
    return NextResponse.json(sessions, { status: 200 });
  }
}
export default new AuthController();

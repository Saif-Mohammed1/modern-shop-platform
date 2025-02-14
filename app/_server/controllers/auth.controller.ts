import { NextRequest, NextResponse } from "next/server";
import { UserValidation } from "../dtos/user.dto";
import AppError from "@/app/lib/utilities/appError";
import { UserService } from "../services/user.service";
import { getDeviceFingerprint } from "@/app/lib/utilities/DeviceFingerprint.utility";
import { AuthService } from "../services/auth.service";
import { UserRole } from "../models/User.model";

export class AuthController {
  private userService = new UserService();

  async register(req: NextRequest) {
    try {
      const body = await req.json();
      const userData = UserValidation.validateUserCreateDTO(body);
      const deviceInfo = await getDeviceFingerprint(req);
      const user = await this.userService.registerUser(userData, deviceInfo);

      return NextResponse.json({ user }, { status: 201 });
    } catch (error) {
      throw error;
    }
  }

  async login(req: NextRequest) {
    try {
      const body = await req.json();

      const result = UserValidation.validateLogin(body);
      const deviceInfo = await getDeviceFingerprint(req);
      const userData = await this.userService.authenticateUser(
        result.email,
        result.password,
        deviceInfo
      );
      // Generate JWT token
      // res.json({ user, token: generateToken(user) });
      return NextResponse.json({ ...userData }, { status: 200 });
    } catch (error) {
      throw error;
    }
  }
  async logout(req: NextRequest) {
    try {
      // const deviceInfo = await getDeviceFingerprint(req);
      await this.userService.logOut();
      // await this.userService.logOut(req.user?._id, deviceInfo);
      return NextResponse.json(
        { message: "Logged out successfully" },
        { status: 200 }
      );
    } catch (error) {
      throw error;
    }
  }
  async forgotPassword(req: NextRequest) {
    try {
      const { email } = await req.json();
      const result = UserValidation.isEmail(email);
      const deviceInfo = await getDeviceFingerprint(req);

      await this.userService.requestPasswordReset(result, deviceInfo);
      return NextResponse.json(
        { message: "Password reset link sent" },
        { status: 200 }
      );
    } catch (error) {
      throw error;
    }
  }
  async isEmailAndTokenValid(req: NextRequest) {
    try {
      // const authMiddleware =
      await AuthService.requireAuth([UserRole.ADMIN])(req);
      // await authMiddleware(req);
      const params = new URLSearchParams(req.nextUrl.searchParams);
      const token = params.get("token");
      const email = params.get("email");
      const result = UserValidation.validateEmailAndToken({ token, email });
      await this.userService.validateEmailAndToken(result.token, result.email);
      return NextResponse.json({ message: "Token is valid" }, { status: 200 });
    } catch (error) {
      throw error;
    }
  }
  async resetPassword(req: NextRequest) {
    try {
      const { token, password } = await req.json();
      const deviceInfo = await getDeviceFingerprint(req);
      const result = UserValidation.validatePasswordReset({ token, password });
      await this.userService.validatePasswordResetToken(
        result.token,
        result.password,
        deviceInfo
      );
      return NextResponse.json(
        { message: "Password reset successful" },
        { status: 200 }
      );
    } catch (error) {
      throw error;
    }
  }
}

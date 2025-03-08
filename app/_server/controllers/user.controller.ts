import { type NextRequest } from "next/server";

import sessionController from "./session.controller";
import { NextResponse } from "next/server";
import { UserValidation } from "../dtos/user.dto";
import { UserTranslate } from "@/public/locales/server/User.translate";
import { lang } from "@/app/lib/utilities/lang";
import { UserService } from "../services/user.service";

class UserController {
  private userService = new UserService();
  async deactivateAccount(req: NextRequest) {
    if (!req.user) return;

    await this.userService.deactivateAccount(String(req.user._id));

    await sessionController.revokeAllUserTokens(req);

    return NextResponse.json(
      { message: UserTranslate[lang].deactivateAccount },
      { status: 200 }
    );
  }
  async deleteAccountByAdmin(req: NextRequest) {
    if (!req.id) return;

    await this.userService.deleteUserByAdmin(req.id);

    return NextResponse.json(
      { message: UserTranslate[lang].deactivateAccount },
      { status: 200 }
    );
  }
  async getAllUsers(req: NextRequest) {
    const users = await this.userService.getAllUsers({
      query: req.nextUrl.searchParams,
    });
    return NextResponse.json(users, { status: 200 });
  }
  async getUser(req: NextRequest) {
    if (!req.id) return;
    const user = await this.userService.findUserById(req.id);
    return NextResponse.json(user?.filterForRole(req.user?.role), {
      status: 200,
    });
  }
  async createUserByAdmin(req: NextRequest) {
    const body = await req.json();
    const result = UserValidation.validateCreateUserByAdminDTO(body);
    const user = await this.userService.createUserByAdmin(result);
    return NextResponse.json(user, { status: 201 });
  }
  async updateUserByAdmin(req: NextRequest) {
    if (!req.id) return;
    const body = await req.json();
    const result = UserValidation.validateUpdateUserByAdminDTO(body);
    const user = await this.userService.updateUserByAdmin(req.id, result);
    return NextResponse.json(user, { status: 200 });
  }
  async revokeAllUserSessions(req: NextRequest) {
    if (!req.id) return;

    await this.userService.revokeAllSessionsByAdmin(req.id);
    return NextResponse.json(
      { message: UserTranslate[lang].revokeAllUserSessions },
      { status: 200 }
    );
  }
  async forceRestPassword(req: NextRequest) {
    if (!req.id) return;
    await this.userService.forcePasswordResetByAdmin(req.id);
    return NextResponse.json(
      { message: UserTranslate[lang].forceRestPassword },
      { status: 200 }
    );
  }
  async lockUserAccount(req: NextRequest) {
    if (!req.id) return;
    await this.userService.lockUserAccount(req.id);
    return NextResponse.json(
      { message: UserTranslate[lang].lockUserAccount },
      { status: 200 }
    );
  }
  async unlockUserAccount(req: NextRequest) {
    if (!req.id) return;
    await this.userService.unlockUserAccount(req.id);
    return NextResponse.json(
      { message: UserTranslate[lang].unlockUserAccount },
      { status: 200 }
    );
  }
}

export default new UserController();

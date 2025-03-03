import { type NextRequest } from "next/server";

import { UserService } from "../services/user.service";
import sessionController from "./session.controller";
import { NextResponse } from "next/server";
import { UserRole } from "@/app/lib/types/users.types";
import { UserValidation } from "../dtos/user.dto";

class UserController {
  private userService = new UserService();

  async deactivateAccount(req: NextRequest) {
    if (!req.user) return;
    await this.userService.deactivateAccount(String(req.user._id));

    await sessionController.revokeAllUserTokens(req);

    return NextResponse.json({ message: "User Deleted" }, { status: 200 });
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
    return NextResponse.json(user?.filterForRole(UserRole.ADMIN), {
      status: 200,
    });
  }
  async createUserByAdmin(req: NextRequest) {
    const body = await req.json();
    const result = UserValidation.validateCreateUserByAdminDTO(body);
    const user = await this.userService.createUserByAdmin(result);
    return NextResponse.json(user, { status: 201 });
  }
}

export default new UserController();

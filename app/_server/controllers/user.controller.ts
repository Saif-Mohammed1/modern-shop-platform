import { type NextRequest } from "next/server";

import { UserService } from "../services/user.service";
import sessionController from "./session.controller";
import { NextResponse } from "next/server";

class UserController {
  private userService = new UserService();

  async deactivateAccount(req: NextRequest) {
    if (!req.user) return;
    this.userService.deactivateAccount(String(req.user._id));

    await sessionController.revokeAllUserTokens(req);

    return NextResponse.json({ message: "User Deleted" }, { status: 200 });
  }
  async getAllUsers(req: NextRequest) {
    const users = await this.userService.getAllUsers({
      query: req.nextUrl.searchParams,
    });
    return NextResponse.json(users, { status: 200 });
  }
}

export default new UserController();

import {type NextRequest, NextResponse} from 'next/server';

import AppError from '@/app/lib/utilities/appError';
import {getDeviceFingerprint} from '@/app/lib/utilities/DeviceFingerprint.utility';
import {lang} from '@/app/lib/utilities/lang';
import {AuthTranslate} from '@/public/locales/server/Auth.Translate';
import {UserTranslate} from '@/public/locales/server/User.translate';

import {UserValidation} from '../dtos/user.dto';
import {UserService} from '../services/user.service';

import sessionController from './session.controller';

class UserController {
  constructor(private readonly userService: UserService = new UserService()) {}
  async deactivateAccount(req: NextRequest) {
    if (!req.user) {throw new AppError(AuthTranslate[lang].errors.userNotFound, 404);}

    await this.userService.deactivateAccount(String(req.user._id));

    await sessionController.revokeAllUserTokens(req);

    return NextResponse.json({message: UserTranslate[lang].deactivateAccount}, {status: 200});
  }
  async deleteAccountByAdmin(req: NextRequest) {
    if (!req.id) {throw new AppError(AuthTranslate[lang].errors.userNotFound, 404);}

    await this.userService.deleteUserByAdmin(req.id);

    return NextResponse.json({message: UserTranslate[lang].deactivateAccount}, {status: 200});
  }
  async getAllUsers(req: NextRequest) {
    const users = await this.userService.getAllUsers({
      query: req.nextUrl.searchParams,
    });
    return NextResponse.json(users, {status: 200});
  }
  async getUser(req: NextRequest) {
    if (!req.id) {throw new AppError(AuthTranslate[lang].errors.userNotFound, 404);}

    const user = await this.userService.findUserById(req.id);
    return NextResponse.json(user?.filterForRole(req.user?.role), {
      status: 200,
    });
  }
  async createUserByAdmin(req: NextRequest) {
    const body = await req.json();
    const result = UserValidation.validateCreateUserByAdminDTO(body);
    const user = await this.userService.createUserByAdmin(result);
    return NextResponse.json(user, {status: 201});
  }
  async updateUserByAdmin(req: NextRequest) {
    if (!req.id) {throw new AppError(AuthTranslate[lang].errors.userNotFound, 404);}

    const body = await req.json();
    const result = UserValidation.validateUpdateUserByAdminDTO(body);
    const user = await this.userService.updateUserByAdmin(req.id, result);
    return NextResponse.json(user, {status: 200});
  }
  async revokeAllUserSessions(req: NextRequest) {
    if (!req.id) {throw new AppError(AuthTranslate[lang].errors.userNotFound, 404);}

    const deviceInfo = await getDeviceFingerprint(req);
    await this.userService.revokeAllSessionsByAdmin(req.id, deviceInfo);
    return NextResponse.json({message: UserTranslate[lang].revokeAllUserSessions}, {status: 200});
  }
  async forceRestPassword(req: NextRequest) {
    if (!req.id) {throw new AppError(AuthTranslate[lang].errors.userNotFound, 404);}

    const deviceInfo = await getDeviceFingerprint(req);
    await this.userService.forcePasswordResetByAdmin(req.id, deviceInfo);
    return NextResponse.json({message: UserTranslate[lang].forceRestPassword}, {status: 200});
  }
  async lockUserAccount(req: NextRequest) {
    if (!req.id) {throw new AppError(AuthTranslate[lang].errors.userNotFound, 404);}

    const deviceInfo = await getDeviceFingerprint(req);
    await this.userService.lockUserAccountByAdmin(req.id, deviceInfo);
    return NextResponse.json({message: UserTranslate[lang].lockUserAccount}, {status: 200});
  }
  async unlockUserAccount(req: NextRequest) {
    if (!req.id) {throw new AppError(AuthTranslate[lang].errors.userNotFound, 404);}

    const deviceInfo = await getDeviceFingerprint(req);
    await this.userService.unlockUserAccountByAdmin(req.id, deviceInfo);
    return NextResponse.json({message: UserTranslate[lang].unlockUserAccount}, {status: 200});
  }
  async updatePassword(req: NextRequest) {
    if (!req.user) {throw new AppError(AuthTranslate[lang].errors.userNotFound, 404);}
    const result = UserValidation.validateChangePassword(await req.json());
    await this.userService.changePassword(req.user._id.toString(), result);
    return NextResponse.json({message: UserTranslate[lang].updatePassword}, {status: 200});
  }
}

export default new UserController();

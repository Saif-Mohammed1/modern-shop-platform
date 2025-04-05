// address.controller.ts
import {type NextRequest, NextResponse} from 'next/server';

import AppError from '@/app/lib/utilities/appError';
import {lang} from '@/app/lib/utilities/lang';
import {AddressTranslate} from '@/public/locales/server/Address.Translate';

import {AddressValidation} from '../dtos/address.dto';
import {AddressService} from '../services/address.service';

class AddressController {
  constructor(private readonly addressService: AddressService = new AddressService()) {}
  async addAddress(req: NextRequest) {
    const body = await req.json();
    const result = AddressValidation.validateCreateAddress({
      userId: req.user?._id,
      ...body,
    });
    const address = await this.addressService.create(result);

    return NextResponse.json(address, {status: 201});
  }

  async deleteMyAddress(req: NextRequest) {
    const result = AddressValidation.validateId({
      id: req.id,

      userId: req.user?._id,
    });
    await this.addressService.deleteMyAddress(String(result.id), String(result.userId));

    return NextResponse.json({message: AddressTranslate[lang].delete.success}, {status: 200});
  }

  async getMyAddress(req: NextRequest) {
    const userId = String(req.user?._id);

    const result = await this.addressService.getUserAddress(userId, {
      query: req.nextUrl.searchParams,

      populate: true,
    });

    return NextResponse.json(result, {status: 200});
  }
  async updateMyAddress(req: NextRequest) {
    if (!req.id) {
      throw new AppError('Address id is required', 400);
    }
    const body = await req.json();
    const result = AddressValidation.validateUpdateAddress({
      userId: req.user?._id,
      ...body,
    });
    const address = await this.addressService.updateAddress(req?.id, result);

    return NextResponse.json(address, {status: 200});
  }
}

export default new AddressController();

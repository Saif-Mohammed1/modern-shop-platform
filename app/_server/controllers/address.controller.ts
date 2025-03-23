// address.controller.ts

import { NextRequest, NextResponse } from "next/server";
import { AddressService } from "../services/address.service";
import { AddressValidation } from "../dtos/address.dto";
import { AddressTranslate } from "@/public/locales/server/Address.Translate";
import { lang } from "@/app/lib/utilities/lang";
import AppError from "@/app/lib/utilities/appError";

class AddressController {
  constructor(
    private readonly addressService: AddressService = new AddressService()
  ) {}
  async addAddress(req: NextRequest) {
    try {
      const body = await req.json();
      const result = AddressValidation.validateCreateAddress({
        userId: req.user?._id,
        ...body,
      });
      const address = await this.addressService.create(result);

      return NextResponse.json(address, { status: 201 });
    } catch (error) {
      throw error;
    }
  }

  async deleteMyAddress(req: NextRequest) {
    try {
      const result = AddressValidation.validateId({
        id: req.id,

        userId: req.user?._id,
      });
      await this.addressService.deleteMyAddress(
        String(result.id),
        String(result.userId)
      );

      return NextResponse.json(
        { message: AddressTranslate[lang].delete.success },
        { status: 200 }
      );
    } catch (error) {
      throw error;
    }
  }

  async getMyAddress(req: NextRequest) {
    try {
      const userId = String(req.user?._id);

      const result = await this.addressService.getUserAddress(userId, {
        query: req.nextUrl.searchParams,

        populate: true,
      });

      return NextResponse.json(result, { status: 200 });
    } catch (error) {
      throw error;
    }
  }
  async updateMyAddress(req: NextRequest) {
    try {
      if (!req.id) {
        throw new AppError("Address id is required", 400);
      }
      const body = await req.json();
      const result = AddressValidation.validateUpdateAddress({
        userId: req.user?._id,
        ...body,
      });
      const address = await this.addressService.updateAddress(req?.id, result);

      return NextResponse.json(address, { status: 200 });
    } catch (error) {
      throw error;
    }
  }
}

export default new AddressController();

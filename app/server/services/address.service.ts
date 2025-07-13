import type { IAddressDB } from "@/app/lib/types/address.db.types";
import type { QueryOptionConfig } from "@/app/lib/types/queryBuilder.types";
import AppError from "@/app/lib/utilities/appError";
import { generateUUID } from "@/app/lib/utilities/id";
import { lang } from "@/app/lib/utilities/lang";
import { AddressTranslate } from "@/public/locales/server/Address.Translate";

import { connectDB } from "../db/db";
import type { CreateAddressDtoType } from "../dtos/address.dto";
import { AddressRepository } from "../repositories/address.repository";

export class AddressService {
  constructor(
    private readonly repository: AddressRepository = new AddressRepository(
      connectDB()
    )
  ) {}
  async create(dto: CreateAddressDtoType) {
    return await this.repository.transaction(async (trx) => {
      const address = await this.repository.create(
        {
          ...dto,
          user_id: dto.user_id,
          postal_code: dto.postal_code,
          _id: generateUUID(),
        },
        trx
      );
      return address;
    });
  }
  async updateAddress(id: string, data: Partial<IAddressDB>) {
    return await this.repository.transaction(async (trx) => {
      const address = await this.repository.update(id, data, trx);
      if (!address) {
        throw new AppError(AddressTranslate[lang].error.addressNotFound, 404);
      }
      return address;
    });
  }
  async getUserAddress(user_id: string, options: QueryOptionConfig) {
    return await this.repository.getUserAddress(user_id, options);
  }
  async deleteMyAddress(id: string, user_id: string) {
    const isDeleted = await this.repository.deleteAddress(id, user_id);
    if (!isDeleted) {
      throw new AppError(AddressTranslate[lang].error.addressNotFound, 404);
    }
  }
  async delete(id: string) {
    const isDeleted = await this.repository.delete(id);
    if (!isDeleted) {
      throw new AppError(AddressTranslate[lang].error.addressNotFound, 404);
    }
  }
}

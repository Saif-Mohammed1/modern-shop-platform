import type {QueryOptionConfig} from '@/app/lib/types/queryBuilder.types';
import AppError from '@/app/lib/utilities/appError';
import {lang} from '@/app/lib/utilities/lang';
import {AddressTranslate} from '@/public/locales/server/Address.Translate';

import type {CreateAddressDtoType} from '../dtos/address.dto';
import AddressModel, {type IAddress} from '../models/Address.model';
import {AddressRepository} from '../repositories/address.repository';

export class AddressService {
  constructor(
    private readonly repository: AddressRepository = new AddressRepository(AddressModel),
  ) {}
  async create(dto: CreateAddressDtoType) {
    const session = await this.repository.startSession();
    session.startTransaction();
    try {
      const address = await this.repository.create(dto, session);
      await session.commitTransaction();
      return address;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }
  async updateAddress(id: string, data: Partial<IAddress>) {
    const session = await this.repository.startSession();
    session.startTransaction();
    try {
      const address = await this.repository.update(id, data, session);
      if (!address) throw new AppError(AddressTranslate[lang].error.addressNotFound, 404);
      await session.commitTransaction();
      return address;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }
  async getUserAddress(userId: string, options: QueryOptionConfig) {
    return await this.repository.getUserAddress(userId, options);
  }
  async deleteMyAddress(id: string, userId: string) {
    const isDeleted = await this.repository.deleteAddress(id, userId);
    if (!isDeleted) throw new AppError(AddressTranslate[lang].error.addressNotFound, 404);
  }
  async delete(id: string) {
    const isDeleted = await this.repository.delete(id);
    if (!isDeleted) throw new AppError(AddressTranslate[lang].error.addressNotFound, 404);
  }
}

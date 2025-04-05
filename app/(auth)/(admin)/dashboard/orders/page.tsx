
import type {Metadata} from 'next';
import {headers} from 'next/headers';
import type {FC} from 'react';

import api from '@/app/lib/utilities/api';
import AppError from '@/app/lib/utilities/appError';
import {lang} from '@/app/lib/utilities/lang';
import AdminOrdersDashboard from '@/components/(admin)/dashboard/orders/orderMangement';
import ErrorHandler from '@/components/Error/errorHandler';
import {ordersTranslate} from '@/public/locales/client/(auth)/(admin)/dashboard/ordersTranslate';

export const metadata: Metadata = {
  title: ordersTranslate.metadata[lang].title,
  description: ordersTranslate.metadata[lang].description,
  keywords: ordersTranslate.metadata[lang].keywords,
};
type SearchParams = {
  email?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  sort?: string;
  page?: string;
  limit?: string;
};
const queryParams = async (searchParams: SearchParams) => {
  const url = new URLSearchParams();

  // Append each parameter only if it's not undefined
  if (searchParams.email !== undefined) {
    url.append('email', searchParams.email);
  }
  if (searchParams.status !== undefined) {
    url.append('status', searchParams.status);
  }
  if (searchParams.startDate !== undefined) {
    url.append('createAt[gte]', searchParams.startDate);
  }
  if (searchParams.endDate !== undefined) {
    url.append('createAt[lte]', searchParams.endDate);
  }
  if (searchParams.sort !== undefined) {
    url.append('sort', searchParams.sort);
  }

  if (searchParams.page !== undefined) {
    url.append('page', searchParams.page);
  }
  if (searchParams.limit !== undefined) {
    url.append('limit', searchParams.limit);
  }

  const queryString = url.toString();
  try {
    // const {
    //   orders, pageCount
    // }
    const {
      data: {docs, meta, links},
    } = await api.get('/admin/dashboard/orders' + (queryString ? `?${queryString}` : ''), {
      headers: Object.fromEntries((await headers()).entries()), // Convert ReadonlyHeaders to plain object
    });

    return {orders: docs, pagination: {meta, links}};
  } catch (error: any) {
    throw new AppError(error.message, error.status);
  }
};
type PageProps = {
  searchParams: Promise<SearchParams>;
};
const page: FC<PageProps> = async (props) => {
  const searchParams = await props.searchParams;
  // const defaultSearchParams = {
  //   email: searchParams.email || undefined,
  //   status: searchParams.status || undefined,
  //   startDate: searchParams.startDate || undefined,
  //   endDate: searchParams.endDate || undefined,
  //   sort: searchParams.sort || undefined,
  //   page: searchParams.page || undefined,
  //   limit: searchParams.limit || undefined,
  // };

  try {
    const {orders, pagination} = await queryParams(searchParams);
    return (
      <AdminOrdersDashboard
        initialOrders={orders}
        pagination={
          pagination || {
            meta: {
              total: 0,
              page: 0,
              limit: 0,
              totalPages: 0,
              hasNext: false,
              hasPrev: false,
            },
            links: {previous: '', next: ''},
          }
        }
      />
    );
  } catch (error: any) {
    return <ErrorHandler message={error.message} />;

    // throw new AppError(error.message, error.status);
  }
};

export default page;

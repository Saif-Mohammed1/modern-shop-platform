'use server';

import {type NextRequest} from 'next/server';

enum Lang {
  uk = 'uk',
  en = 'en',
}

export const getLang = (req: NextRequest): Lang => {
  const lang = (req.cookies.get('lang')?.value as Lang) || Lang.uk;
  return lang;
};

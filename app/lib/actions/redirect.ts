// app/actions/redirect.ts
'use server';

import {redirect} from 'next/navigation';

// app/actions/redirect.ts

export async function handleRedirect(href: string) {
  redirect(href);
}

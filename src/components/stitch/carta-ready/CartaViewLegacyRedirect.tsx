'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export interface CartaViewLegacyRedirectProps {
  readonly legacyHref: string;
}

export default function CartaViewLegacyRedirect({ legacyHref }: Readonly<CartaViewLegacyRedirectProps>) {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('view') === 'legacy') {
      router.replace(legacyHref);
    }
  }, [legacyHref, router, searchParams]);

  return null;
}

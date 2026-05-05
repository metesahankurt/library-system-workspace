'use server';

import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337';

export async function createReservation(bookDocumentId: string) {
  const session = await getSession();
  
  if (!session) {
    throw new Error('Rezervasyon yapmak için giriş yapmalısınız.');
  }

  try {
    const res = await fetch(`${STRAPI_URL}/api/reservations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.jwt}`,
      },
      body: JSON.stringify({
        data: {
          book: bookDocumentId,
          status: 'pending',
          reservedAt: new Date().toISOString(),
        },
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message ?? 'Rezervasyon oluşturulamadı.');
    }

    revalidatePath(`/kutuphane/${bookDocumentId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Reservation error:', error);
    return { error: error.message || 'Bir hata oluştu.' };
  }
}

export async function lendBookFromReservation(reservationId: string) {
  const session = await getSession();
  if (!session) throw new Error('Yetkisiz erişim.');

  try {
    const response = await fetch(`${STRAPI_URL}/api/reservations/${reservationId}/fulfill`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.jwt}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result?.error?.message || 'İşlem tamamlanamadı.');
    }

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    console.error('Lending error:', error);
    return { error: error.message || 'Ödünç verme işlemi başarısız.' };
  }
}

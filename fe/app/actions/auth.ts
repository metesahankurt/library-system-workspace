'use server';

import { redirect } from 'next/navigation';
import { createSession, deleteSession, strapiLogin } from '@/lib/auth';

type ActionState = { error: string } | undefined;

export async function loginAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const identifier = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!identifier || !password) {
    return { error: 'E-posta ve şifre zorunludur.' };
  }

  try {
    const { jwt, user } = await strapiLogin(identifier, password);
    await createSession(jwt, user);
  } catch (err: any) {
    return { error: err.message ?? 'Giriş yapılamadı.' };
  }

  redirect('/');
}

export async function logoutAction() {
  await deleteSession();
  redirect('/');
}

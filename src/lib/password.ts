import bcrypt from "bcryptjs";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  passwordHash: string
): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

export function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return "パスワードは8文字以上で入力してください";
  }
  return null;
}

export function validateEmail(email: string): string | null {
  const normalized = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    return "メールアドレスの形式が正しくありません";
  }
  return null;
}

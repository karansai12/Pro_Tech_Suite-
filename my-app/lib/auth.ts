import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function getAuthUser() {
  const token = (await cookies()).get("token")?.value;
  if (!token) return null;

  try {
    return jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: string;
      email: string;
    };
  } catch {
    return null;
  }
}

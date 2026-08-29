import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  const payload = await getAuthUser();

  if (!payload?.userId) {
    return NextResponse.json({ error: "Not Authenticated" }, { status: 401 });
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { role: true },
  });

  if (currentUser?.role !== "MANAGER") {
    return NextResponse.json(
      { error: "Only managers can view employees" },
      { status: 403 },
    );
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Failed to fetch users", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

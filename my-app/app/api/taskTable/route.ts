import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  const payload = await getAuthUser();

  if (!payload?.userId) {
    return NextResponse.json({ error: "Not Authenticated" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { role: true },
    });

    const tasks = await prisma.task.findMany({
      where:
        user?.role === "MANAGER"
          ? undefined
          : { assignedTo: payload.userId },
      select: {
        id: true,
        taskName: true,
        taskDescription: true,
        dueDate: true,
        status: true,
        assignedTo: true,
        projectId: true,
        assignee: {
          select: {
            id: true,
            firstName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("Failed to fetch tasks", error);
    return NextResponse.json(
      { error: "Failed to load tasks" },
      { status: 500 },
    );
  }
}

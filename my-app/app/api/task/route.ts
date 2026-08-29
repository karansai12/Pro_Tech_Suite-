import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

const TASK_STATUSES = ["OPEN", "INPROGRESS", "COMPLETED"] as const;

export async function POST(request: Request) {
  const payload = await getAuthUser();

  if (!payload?.userId) {
    return NextResponse.json({ error: "Not Authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const { taskName, taskDescription, projectId, assignedTo, dueDate, status } =
    body;

  if (!taskName || !taskDescription || !projectId || !assignedTo || !dueDate) {
    return NextResponse.json(
      {
        error:
          "Task name, description, project, assignee, and due date are required",
      },
      { status: 400 },
    );
  }

  const taskStatus = TASK_STATUSES.includes(status) ? status : "OPEN";

  await prisma.task.create({
    data: {
      taskName,
      taskDescription,
      dueDate: new Date(dueDate),
      status: taskStatus,
      project: {
        connect: { id: projectId },
      },
      assignee: {
        connect: { id: assignedTo },
      },
    },
  });

  return NextResponse.json({ success: true }, { status: 201 });
}

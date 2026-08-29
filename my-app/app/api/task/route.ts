import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

const TASK_STATUSES = ["OPEN", "INPROGRESS", "COMPLETED"] as const;

export async function POST(request: Request) {
  const payload = await getAuthUser();

  if (!payload?.userId) {
    return NextResponse.json({ error: "Not Authenticated" }, { status: 401 });
  }

  const creator = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { role: true },
  });

  if (creator?.role !== "MANAGER") {
    return NextResponse.json(
      { error: "Only managers can create a task" },
      { status: 403 },
    );
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

export async function DELETE(request: Request) {
  const payload = await getAuthUser();

  if (!payload?.userId) {
    return NextResponse.json({ error: "Not Authenticated" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { role: true },
  });

  if (user?.role !== "MANAGER") {
    return NextResponse.json(
      { error: "Only managers can delete a task" },
      { status: 403 },
    );
  }

  const body = await request.json();
  const { taskId } = body;

  if (!taskId) {
    return NextResponse.json({ error: "Task id is required" }, { status: 400 });
  }

  try {
    await prisma.task.delete({
      where: { id: taskId },
    });
  } catch {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}

export async function PATCH(request: Request) {
  const payload = await getAuthUser();

  if (!payload?.userId) {
    return NextResponse.json({ error: "Not Authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const { taskId, status } = body;

  if (!taskId || !status) {
    return NextResponse.json(
      { error: "Task id and status are required" },
      { status: 400 },
    );
  }

  if (!TASK_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const [user, task] = await Promise.all([
    prisma.user.findUnique({
      where: { id: payload.userId },
      select: { role: true },
    }),
    prisma.task.findUnique({
      where: { id: taskId },
      select: { assignedTo: true },
    }),
  ]);

  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  const isManager = user?.role === "MANAGER";
  const isAssignee = task.assignedTo === payload.userId;

  if (!isManager && !isAssignee) {
    return NextResponse.json(
      { error: "Only the assignee or a manager can change status" },
      { status: 403 },
    );
  }

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: { status },
  });

  return NextResponse.json({ success: true, status: updated.status });
}

export async function GET(request: Request) {
  const payload = await getAuthUser();

  if (!payload?.userId) {
    return NextResponse.json({ error: "Not Authenticated" }, { status: 401 });
  }

  const taskId = new URL(request.url).searchParams.get("id");

  if (!taskId) {
    return NextResponse.json({ error: "Task id is required" }, { status: 400 });
  }

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: {
      id: true,
      taskName: true,
      taskDescription: true,
      projectId: true,
      assignedTo: true,
      dueDate: true,
      status: true,
      project: {
        select: {
          id: true,
          projectTitle: true,
        },
      },
      assignee: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  return NextResponse.json({ task });
}

export async function PUT(request: Request) {
  const payload = await getAuthUser();

  if (!payload?.userId) {
    return NextResponse.json({ error: "Not Authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const {
    taskId,
    taskName,
    taskDescription,
    projectId,
    assignedTo,
    dueDate,
    status,
  } = body;

  if (
    !taskId ||
    !taskName ||
    !taskDescription ||
    !projectId ||
    !assignedTo ||
    !dueDate
  ) {
    return NextResponse.json(
      {
        error:
          "Task id, name, description, project, assignee, and due date are required",
      },
      { status: 400 },
    );
  }

  if (!TASK_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const [user, task] = await Promise.all([
    prisma.user.findUnique({
      where: { id: payload.userId },
      select: { role: true },
    }),
    prisma.task.findUnique({
      where: { id: taskId },
      select: { assignedTo: true },
    }),
  ]);

  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  const isManager = user?.role === "MANAGER";
  const isAssignee = task.assignedTo === payload.userId;

  if (!isManager && !isAssignee) {
    return NextResponse.json(
      { error: "Only the assignee or a manager can edit this task" },
      { status: 403 },
    );
  }

  await prisma.task.update({
    where: { id: taskId },
    data: {
      taskName,
      taskDescription,
      dueDate: new Date(dueDate),
      status,
      project: { connect: { id: projectId } },
      assignee: { connect: { id: assignedTo } },
    },
  });

  return NextResponse.json({ success: true });
}
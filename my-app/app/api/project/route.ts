import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function POST(request: Request) {
  const payload = await getAuthUser();

  if (!payload?.userId) {
    return NextResponse.json({ error: "Not Authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const { projectName, projectDescription } = body;

  if (!projectName || !projectDescription) {
    return NextResponse.json(
      { error: "Project Name and Project Description are required" },
      { status: 400 },
    );
  }

  await prisma.project.create({
    data: {
      projectTitle: projectName,
      projectDescription: projectDescription,
      status: "PENDING",
      user: {
        connect: {
          id: payload.userId,
        },
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
      { error: "Only managers can delete a project" },
      { status: 403 },
    );
  }

  const body = await request.json();
  const { projectId } = body;

  if (!projectId) {
    return NextResponse.json(
      { error: "Project id is required" },
      { status: 400 },
    );
  }

  try {
    await prisma.$transaction([
      prisma.task.deleteMany({ where: { projectId } }),
      prisma.project.delete({ where: { id: projectId } }),
    ]);
  } catch {
    return NextResponse.json(
      { error: "Project not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
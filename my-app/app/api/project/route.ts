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

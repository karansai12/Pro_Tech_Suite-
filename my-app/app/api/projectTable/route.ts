import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try{
        const projects = await prisma.project.findMany({
            select: {
                id: true,
                projectTitle: true,
                projectDescription: true,
                status: true,
                createdAt: true,
                user: {
                    select: {
                        firstName: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json({ projects });
    } catch (error) {
        console.error("Failed to fetch projects", error);
        return NextResponse.json({ error: "Failed to load projects" }, { status: 500 });
    }
}
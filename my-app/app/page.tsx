"use client"
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter()
  return (
    <div className="mx-auto flex min-h-[80vh] max-w-3xl flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-4xl font-semibold">ProTech Suite</h1>
      <p className="text-center text-foreground">
        ProTech Suite is a full-stack project management application built with
        Next.js, TypeScript, and PostgreSQL (via Prisma ORM). It supports two
        user roles — Manager and Employee — each with tailored permissions and
        views. Managers can create projects, assign tasks to employees, and
        track progress, while employees view their assigned tasks and update
        status in real time. Role-based access control runs throughout the app,
        ensuring each user only sees and modifies what they are permitted to.
        Built with a clean component architecture using shadcn/ui and AG Grid
        for data tables, ProTech Suite demonstrates end-to-end full-stack
        development — from database schema design and RESTful API routes to
        authentication, authorization, and a responsive React frontend.
      </p>
      <div className="flex flex-row items-center justify-center gap-2">
        <Button onClick={()=>router.push("/login-page")}>
          Login
        </Button>
        <Button onClick={()=>router.push("/signup-page")} variant="outline">
          Signup
        </Button>
      </div>
    </div>
  );
}

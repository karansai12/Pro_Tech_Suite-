"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Controller, useForm } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useStore from "@/lib/store";

type TaskStatus = "OPEN" | "INPROGRESS" | "COMPLETED";

type Task = {
  title: string;
  description: string;
  projectId: string;
  assignedTo: string;
  dueDate: string;
  status: TaskStatus;
};

type ProjectOption = {
  id: string;
  projectTitle: string;
};

type UserOption = {
  id: string;
  firstName: string;
  lastName: string;
};

const statusItems: { label: string; value: TaskStatus }[] = [
  { label: "OPEN", value: "OPEN" },
  { label: "IN PROGRESS", value: "INPROGRESS" },
  { label: "COMPLETED", value: "COMPLETED" },
];

function toDateInputValue(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function TaskPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const taskId = searchParams.get("id");
  const { role, id: userId } = useStore((state) => state.user);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [canEdit, setCanEdit] = useState(!taskId);
  const [formReady, setFormReady] = useState(!taskId);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
  } = useForm<Task>({
    defaultValues: {
      status: "OPEN",
    },
  });

  useEffect(() => {
    if (role === "EMPLOYEE") {
      router.replace("/taskTable-page");
      return;
    }

    const loadForm = async () => {
      try {
        const [projectsRes, usersRes] = await Promise.all([
          fetch("/api/projectTable"),
          fetch("/api/users"),
        ]);

        if (!projectsRes.ok) {
          throw new Error("Failed to load projects");
        }
        if (!usersRes.ok) {
          throw new Error("Failed to load users");
        }

        const projectData = await projectsRes.json();
        const userData = await usersRes.json();
        let nextProjects: ProjectOption[] = projectData.projects || [];
        let nextUsers: UserOption[] = userData.users || [];

        if (!taskId) {
          setProjects(nextProjects);
          setUsers(nextUsers);
          setCanEdit(true);
          setFormReady(true);
          return;
        }

        const taskRes = await fetch(`/api/task?id=${taskId}`);
        if (!taskRes.ok) {
          throw new Error("Failed to load task");
        }
        const { task } = await taskRes.json();
        const isManager = role === "MANAGER";
        const isAssignee = task.assignedTo === userId;
        if (!isManager && !isAssignee) {
          setCanEdit(false);
          setLoadError("Only the assignee or a manager can edit this task");
          setFormReady(true);
          return;
        }

        if (
          task.project &&
          !nextProjects.some((project) => project.id === task.project.id)
        ) {
          nextProjects = [task.project, ...nextProjects];
        }
        if (
          task.assignee &&
          !nextUsers.some((user) => user.id === task.assignee.id)
        ) {
          nextUsers = [task.assignee, ...nextUsers];
        }

        setProjects(nextProjects);
        setUsers(nextUsers);
        setCanEdit(true);
        reset({
          title: task.taskName,
          description: task.taskDescription,
          projectId: task.projectId,
          assignedTo: task.assignedTo,
          dueDate: toDateInputValue(task.dueDate),
          status: task.status,
        });
        setFormReady(true);
      } catch (err) {
        setLoadError(
          err instanceof Error ? err.message : "Failed to load form options",
        );
        setFormReady(true);
      }
    };

    loadForm();
  }, [reset, role, router, taskId, userId]);

  const handleOnSubmitTask = async (task: Task) => {
    if (taskId && !canEdit) return;

    try {
      const response = await fetch("/api/task", {
        method: taskId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(taskId ? { taskId } : {}),
          taskName: task.title,
          taskDescription: task.description,
          projectId: task.projectId,
          assignedTo: task.assignedTo,
          dueDate: task.dueDate,
          status: task.status,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        router.push("/taskTable-page");
      } else {
        setLoadError(result.error || "Failed to submit.");
        console.error("Server said:", result);
      }
    } catch (error) {
      console.error("Error", error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(handleOnSubmitTask)}
      className="flex flex-col justify-center border border-black rounded-md w-2xl gap-2 p-4 m-auto"
    >
      <h2 className="flex items-center justify-center">
        {taskId ? "Edit Task" : "Task"}
      </h2>
      {loadError && <p className="text-sm text-red-500">{loadError}</p>}
      {taskId && !formReady ? (
        <p className="text-sm">Loading saved task...</p>
      ) : null}
      <span>Task Title</span>
      <Input
        className={`w-full ${errors.title ? "border-red-500" : ""}`}
        placeholder="Task Title"
        disabled={Boolean(taskId) && !canEdit}
        {...register("title", { required: "This field is requird" })}
      />
      {errors.title && (
        <p className="text-sm text-red-500">{errors.title.message}</p>
      )}
      <span>Task Description</span>
      <Input
        className={`w-full ${errors.description ? "border-red-500" : ""}`}
        placeholder="Task Description"
        disabled={Boolean(taskId) && !canEdit}
        {...register("description", { required: "This field is requird" })}
      />
      {errors.description && (
        <p className="text-sm text-red-500">{errors.description.message}</p>
      )}
      <span>Projects</span>
      {formReady ? (
      <Controller
        name="projectId"
        control={control}
        rules={{ required: "This field is required*" }}
        render={({ field }) => (
          <Select
            key={`project-${field.value ?? "empty"}`}
            value={field.value ?? null}
            onValueChange={field.onChange}
            disabled={Boolean(taskId) && !canEdit}
            items={projects.map((project) => ({
              value: project.id,
              label: project.projectTitle,
            }))}
          >
            <SelectTrigger
              className={`w-full ${errors.projectId ? "border-red-500" : ""}`}
            >
              <SelectValue placeholder="Select Project" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.projectTitle}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        )}
      />
      ) : null}
      {errors.projectId && (
        <p className="text-sm text-red-500">{errors.projectId.message}</p>
      )}
      <span>Assigned To</span>
      {formReady ? (
      <Controller
        name="assignedTo"
        control={control}
        rules={{ required: "This field is required*" }}
        render={({ field }) => (
          <Select
            key={`assignee-${field.value ?? "empty"}`}
            value={field.value ?? null}
            onValueChange={field.onChange}
            disabled={Boolean(taskId) && !canEdit}
            items={users.map((user) => ({
              value: user.id,
              label: `${user.firstName} ${user.lastName}`.trim(),
            }))}
          >
            <SelectTrigger
              className={`w-full ${errors.assignedTo ? "border-red-500" : ""}`}
            >
              <SelectValue placeholder="Select Assignee" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.firstName} {user.lastName}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        )}
      />
      ) : null}
      {errors.assignedTo && (
        <p className="text-sm text-red-500">{errors.assignedTo.message}</p>
      )}
      <span>Due Date</span>
      <Input
        type="date"
        className={`w-full ${errors.dueDate ? "border-red-500" : ""}`}
        disabled={Boolean(taskId) && !canEdit}
        {...register("dueDate", { required: "This field is requird" })}
      />
      {errors.dueDate && (
        <p className="text-sm text-red-500">{errors.dueDate.message}</p>
      )}
      <span>Status</span>
      {formReady ? (
      <Controller
        name="status"
        control={control}
        rules={{ required: "This field is required*" }}
        render={({ field }) => (
          <Select
            key={`status-${field.value ?? "empty"}`}
            value={field.value ?? null}
            onValueChange={field.onChange}
            disabled={Boolean(taskId) && !canEdit}
            items={statusItems}
          >
            <SelectTrigger
              className={`w-full ${errors.status ? "border-red-500" : ""}`}
            >
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {statusItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        )}
      />
      ) : null}
      {errors.status && (
        <p className="text-sm text-red-500">{errors.status.message}</p>
      )}
      <div className="flex gap-2 justify-center items-center p-2">
        <Button
          type="submit"
          className="p-4 text-xl"
          disabled={Boolean(taskId) && !canEdit}
        >
          {taskId ? "Update Task" : "Add Task"}
        </Button>
      </div>
    </form>
  );
}

export default function TaskPageRoute() {
  return (
    <Suspense fallback={<p className="p-4">Loading task form...</p>}>
      <TaskPage />
    </Suspense>
  );
}

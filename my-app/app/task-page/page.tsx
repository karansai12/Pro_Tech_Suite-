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
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

const TaskPage = () => {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<Task>({
    defaultValues: {
      status: "OPEN",
    },
  });

  useEffect(() => {
    const loadOptions = async () => {
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
        setProjects(projectData.projects || []);
        setUsers(userData.users || []);
      } catch (err) {
        setLoadError(
          err instanceof Error ? err.message : "Failed to load form options",
        );
      }
    };

    loadOptions();
  }, []);

  const handleOnSubmitTask = async (task: Task) => {
    try {
      const response = await fetch("/api/task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
        console.error("Server said:", result);
        throw new Error("Failed to submit.");
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
      <h2 className="flex items-center justify-center">Task</h2>
      {loadError && <p className="text-sm text-red-500">{loadError}</p>}
      <span>Task Title</span>
      <Input
        className={`w-full ${errors.title ? "border-red-500" : ""}`}
        placeholder="Task Title"
        {...register("title", { required: "This field is requird" })}
      />
      {errors.title && (
        <p className="text-sm text-red-500">{errors.title.message}</p>
      )}
      <span>Task Description</span>
      <Input
        className={`w-full ${errors.description ? "border-red-500" : ""}`}
        placeholder="Task Description"
        {...register("description", { required: "This field is requird" })}
      />
      {errors.description && (
        <p className="text-sm text-red-500">{errors.description.message}</p>
      )}
      <span>Projects</span>
      <Controller
        name="projectId"
        control={control}
        rules={{ required: "This field is required*" }}
        render={({ field }) => (
          <Select value={field.value} onValueChange={field.onChange} items={projects.map((project)=>({
            value: project.id,
            label:project.projectTitle
          }))}>
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
      {errors.projectId && (
        <p className="text-sm text-red-500">{errors.projectId.message}</p>
      )}
      <span>Assigned To</span>
      <Controller
        name="assignedTo"
        control={control}
        rules={{ required: "This field is required*" }}
        render={({ field }) => (
          <Select value={field.value} onValueChange={field.onChange} items={users.map((user)=>({
            value: user.id,
            label:user.firstName.trim()
          }))}>
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
      {errors.assignedTo && (
        <p className="text-sm text-red-500">{errors.assignedTo.message}</p>
      )}
      <span>Due Date</span>
      <Input
        type="date"
        className={`w-full ${errors.dueDate ? "border-red-500" : ""}`}
        {...register("dueDate", { required: "This field is requird" })}
      />
      {errors.dueDate && (
        <p className="text-sm text-red-500">{errors.dueDate.message}</p>
      )}
      <span>Status</span>
      <Controller
        name="status"
        control={control}
        rules={{ required: "This field is required*" }}
        render={({ field }) => (
          <Select value={field.value} onValueChange={field.onChange}>
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
      {errors.status && (
        <p className="text-sm text-red-500">{errors.status.message}</p>
      )}
      <div className="flex gap-2 justify-center items-center p-2">
        <Button type="submit" className="p-4 text-xl">
          Add Task
        </Button>
      </div>
    </form>
  );
};

export default TaskPage;

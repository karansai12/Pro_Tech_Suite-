"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

type Project = {
  title: string;
  description: string;
};

const ProjectPage = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Project>();

  const handleOnSubmitProject = async (project: Project) => {
    try {
      const response = await fetch("/api/project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName: project.title,
          projectDescription: project.description,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        console.log("Success", result);
        router.push("/projectTable-page");
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
      onSubmit={handleSubmit(handleOnSubmitProject)}
      className="flex flex-col justify-center border border-black rounded-md w-2xl gap-2 p-4 m-auto"
    >
      <h2 className="flex items-center justify-center">Project</h2>
      <span>Project Title</span>
      <Input
        className={`w-full ${errors.title ? "border-red-500" : ""}`}
        placeholder="Project Title"
        {...register("title", { required: "This field is requird" })}
      />
      {errors.title && (
        <p className="text-sm text-red-500">{errors.title.message}</p>
      )}
      <span>Project Description</span>
      <Input
        className={`w-full ${errors.description ? "border-red-500" : ""}`}
        placeholder="Project Description"
        {...register("description", { required: "This field is requird" })}
      />
      {errors.description && (
        <p className="text-sm text-red-500">{errors.description.message}</p>
      )}
      <div className="flex gap-2 justify-center items-center p-2">
        <Button type="submit" className="p-4 text-xl">
          Add Project
        </Button>
      </div>
    </form>
  );
};

export default ProjectPage;

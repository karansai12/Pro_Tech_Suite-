"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Controller,useForm } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Status = "PENDING" | "ACTIVE" | "REJECTED";

type Project = {
  title: string;
  description: string;
  status: Status;
};

interface StatusItem {
  label: string;
  value: string;
}

const items: StatusItem[] = [
  { label: "PENDING", value: "PENDING" },
  { label: "ACTIVE", value: "ACTIVE" },
  { label: "REJECTED", value: "REJECTED" },
];

const ProjectPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control
  } = useForm<Project>();

  const handleOnSubmitProject = () => {};

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
                  {items.map((item) => (
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
          Add Project
        </Button>
      </div>
    </form>
  );
};

export default ProjectPage;

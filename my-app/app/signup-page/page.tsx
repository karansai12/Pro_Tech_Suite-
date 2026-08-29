"use client";
import React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Controller, useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FormData = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
};

interface RoleItem {
  label: string;
  value: string;
}

const items: RoleItem[] = [
  { label: "Manager", value: "manager" },
  { label: "Employee", value: "employee" },
];

const SignUpPage: React.FC = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>();

  const handleOnSubmit = async (formData: FormData) => {
    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: formData.role,
        }),
      });

      if (response.ok) {
        router.push("/login-page");
      } else {
        throw new Error("Failed to submit form");
      }
      const result = await response.json();
      console.log("Success", result);
    } catch (error) {
      console.error("Error", error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(handleOnSubmit)}
      className="flex flex-col justify-center items-center border border-border rounded-md w-2xl gap-2 p-4 m-auto bg-card text-foreground"
    >
      <h2 className="flex items-center justify-center">Sign Up</h2>
      <div className="flex flex-col gap-2 w-full">
        <span>First Name</span>
        <Input
          placeholder="First Name"
          className={`w-full ${errors.firstName ? "border-red-500" : ""}`}
          {...register("firstName", { required: "This field is required*" })}
        />
        {errors.firstName && (
          <p className="text-sm text-red-500">{errors.firstName.message}</p>
        )}
        <span>Last Name</span>
        <Input
          placeholder="Last Name"
          className={`w-full ${errors.lastName ? "border-red-500" : ""}`}
          {...register("lastName", { required: "This field is required*" })}
        />
        {errors.lastName && (
          <p className="text-sm text-red-500">{errors.lastName.message}</p>
        )}
        <span>Select Role</span>
        <Controller
          name="role"
          control={control}
          rules={{ required: "This field is required*" }}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger
                className={`w-full ${errors.role ? "border-red-500" : ""}`}
              >
                <SelectValue placeholder="Select Role" />
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
        {errors.role && (
          <p className="text-sm text-red-500">{errors.role.message}</p>
        )}
        <span>Email</span>
        <Input
          className={`w-full ${errors.email ? "border-red-500" : ""}`}
          placeholder="Email"
          type="email"
          {...register("email", { required: "This field is required*" })}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
        <span>Password</span>
        <Input
          className={`w-full ${errors.password ? "border-red-500" : ""}`}
          placeholder="Password"
          type="password"
          {...register("password", { required: "This field is required*" })}
        />
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>
      <div className="flex gap-2 justify-center items-center p-2">
        <Button type="submit" className="px-2 py-2 text-xl">
          Sign Up
        </Button>
        <span>
          Already have an Account?{" "}
          <Link href="/login-page" className="text-blue-400">
            Log In
          </Link>
        </span>
      </div>
    </form>
  );
};

export default SignUpPage;

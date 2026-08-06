"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter } from "next/navigation";

type FormData = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

const SignUpPage = () => {
  const router = useRouter()
  const { register, handleSubmit } = useForm<FormData>();

  const handleOnSubmit = async (formData: FormData) => {
    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
        }),
      });
      if(response.ok){
        router.push("/login-page")
      }else{
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
      className="flex flex-col justify-center items-center border border-black rounded-md w-2xl gap-2 p-4 m-auto"
    >
      <h2 className="flex items-center justify-center">Sign Up</h2>
      <div className="flex flex-col gap-2 w-full">
        <span>First Name</span>
        <Input
          placeholder="First Name"
          {...register("firstName", { required: "This field is required" })}
        />
        <span>Last Name</span>
        <Input
          placeholder="Last Name"
          {...register("lastName", { required: "This field is required" })}
        />
        <span>Email</span>
        <Input
          placeholder="Email"
          type="email"
          {...register("email", { required: "This field is required" })}
        />
        <span>Password</span>
        <Input
          placeholder="Password"
          type="password"
          {...register("password", { required: "This field is required" })}
        />
      </div>
      <div className="flex gap-4 justify-center items-center p-2">
        <Button type="submit" className="px-2 py-2 text-xl">
          Sign Up
        </Button>
        <span>
          Don^t have an Account? <Link href="/login-page">Log In</Link>
        </span>
      </div>
    </form>
  );
};

export default SignUpPage;

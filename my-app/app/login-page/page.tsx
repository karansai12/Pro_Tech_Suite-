"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useStore from "@/lib/store";

type FormData = {
  email: string;
  password: string;
};

const LoginPage = () => {
  const { register, handleSubmit,  formState: { errors }, } = useForm<FormData>();
  const router = useRouter();

  const setUser = useStore((state)=>state.setUser)

  const handleOnSubmit = async (formData: FormData) => {
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers:{"Content-type":"application/hson"},
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });
      
      if (response.ok) {
        router.push("/home-page");
      } else {
        throw new Error("Failed to submit form");
      }
      const result = await response.json();
      setUser(result.user)
      console.log("Success", result);
    } catch (error) {
      console.error("Error", error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(handleOnSubmit)}
      className="flex flex-col justify-center border border-black rounded-md w-2xl gap-2 p-4 m-auto"
    >
      <h2 className="flex items-center justify-center">Log In</h2>
      <span>Email</span>
      <Input  className={`w-full ${errors.email ? "border-red-500" : ""}`}
        placeholder="Email"
        type="email"
        {...register("email", { required: true })}
      />
       {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      <span>Password</span>
      <Input  className={`w-full ${errors.password ? "border-red-500" : ""}`}
        placeholder="Password"
        type="password"
        {...register("password", { required: true })}
      />
       {errors.password && (
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}
      <div className="flex gap-2 justify-center items-center p-2">
        <Button type="submit" className="p-4 text-xl">
          Log In
        </Button>
        <span>
          Dont have an Account!
          <Link href="/signup-page" className="text-blue-400">
            Sign Up
          </Link>
        </span>
      </div>
    </form>
  );
};

export default LoginPage;

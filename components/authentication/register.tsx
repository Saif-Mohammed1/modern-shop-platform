"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import toast from "react-hot-toast";
import Spinner from "../spinner/spinner";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "../../app/lib/utilities/api";
import { registerTranslate } from "@/public/locales/client/(public)/auth/registerTranslate";
import { lang } from "../../app/lib/utilities/lang";
import { useState } from "react";
import { userZodValidatorTranslate } from "@/public/locales/server/userControllerTranslate";
import { FiLock, FiMail, FiUser } from "react-icons/fi";
import Input from "../ui/Input";

// Allowed email domains
const allowedEmailDomains = ["gmail.com", "yahoo.com", "outlook.com"];

// Zod schema
const registerSchema = z
  .object({
    name: z
      .string({
        required_error: userZodValidatorTranslate[lang].name.required,
      })
      .min(3, userZodValidatorTranslate[lang].name.minLength)
      .max(50, userZodValidatorTranslate[lang].name.maxLength),
    email: z
      .string({
        required_error: userZodValidatorTranslate[lang].email.required,
      })
      .email(userZodValidatorTranslate[lang].email.invalid)
      .refine(
        (email) => allowedEmailDomains.includes(email.split("@")[1]),
        userZodValidatorTranslate[lang].email.domainNotAllowed
      ),
    phone: z
      .string({
        // required_error: userZodValidatorTranslate[lang].phone.required,
      })
      .regex(
        /^\+?[1-9]\d{1,14}$/,
        userZodValidatorTranslate[lang].phone.invalid
      )
      .optional()
      .or(z.literal("")),
    password: z
      .string({
        required_error: userZodValidatorTranslate[lang].password.required,
      })
      .min(10, userZodValidatorTranslate[lang].password.minLength)
      .max(40, userZodValidatorTranslate[lang].password.maxLength)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
        userZodValidatorTranslate[lang].password.invalid
      ),
    confirmPassword: z.string({
      required_error: userZodValidatorTranslate[lang].confirmPassword.required,
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: userZodValidatorTranslate[lang].confirmPassword.invalid,
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

const RegisterPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl");
  const router = useRouter();

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      await api.post("/auth/register", data);
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) throw new Error(result.error);

      router.replace(callbackUrl || "/");
      toast.success(registerTranslate[lang].functions.handleRegister.success);
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : registerTranslate[lang].functions.handleRegister.error
      );
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
        {registerTranslate[lang].form.title}
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name Field */}
        <Input
          icon={<FiUser />}
          {...register("name")}
          label={registerTranslate[lang].form.name.label}
          placeholder={registerTranslate[lang].form.name.placeholder}
          error={errors.name?.message}
        />

        {/* Email Field */}
        {/* <div>
          <label className="block text-gray-600">
            {registerTranslate[lang].form.email.label}
          </label>
          <input
            type="email"
            {...register("email")}
            placeholder={registerTranslate[lang].form.email.placeholder}
            className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div> */}
        <Input
          icon={<FiMail />}
          {...register("email")}
          label={registerTranslate[lang].form.email.label}
          placeholder={registerTranslate[lang].form.email.placeholder}
          error={errors.email?.message}
        />
        {/* Password Field */}
        {/* <div>
          <label className="block text-gray-600">
            {registerTranslate[lang].form.password.label}
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              {...register("password")}
              placeholder={registerTranslate[lang].form.password.placeholder}
              className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-2 flex items-center text-gray-500"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <AiFillEye /> : <AiFillEyeInvisible />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">
              {errors.password.message}
            </p>
          )}
        </div> */}
        <div className="relative">
          <Input
            {...register("password")}
            label={registerTranslate[lang].form.password.label}
            placeholder={registerTranslate[lang].form.password.placeholder}
            type={showPassword ? "text" : "password"}
            error={errors.password?.message}
            icon={<FiLock />}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-2 flex items-center text-gray-500"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <AiFillEye /> : <AiFillEyeInvisible />}
          </button>
        </div>
        {/* Confirm Password Field */}
        {/* <div>
          <label className="block text-gray-600">
            {registerTranslate[lang].form.confirmPassword.label}
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              {...register("confirmPassword")}
              placeholder={
                registerTranslate[lang].form.confirmPassword.placeholder
              }
              className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-2 flex items-center text-gray-500"
              aria-label={
                showConfirmPassword ? "Hide password" : "Show password"
              }
            >
              {showConfirmPassword ? <AiFillEye /> : <AiFillEyeInvisible />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div> */}

        <div className="relative">
          <Input
            {...register("confirmPassword")}
            label={registerTranslate[lang].form.confirmPassword.label}
            placeholder={
              registerTranslate[lang].form.confirmPassword.placeholder
            }
            type={showConfirmPassword ? "text" : "password"}
            error={errors.confirmPassword?.message}
            icon={<FiLock />}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-2 flex items-center text-gray-500"
            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
          >
            {showConfirmPassword ? <AiFillEye /> : <AiFillEyeInvisible />}
          </button>
        </div>
        <button
          type="submit"
          disabled={!!errors.name || !!errors.email || !!errors.password}
          className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? <Spinner /> : registerTranslate[lang].form.submit}
        </button>
      </form>

      <div className="text-center mt-4">
        <Link href="/auth" className="text-blue-500 hover:underline">
          {registerTranslate[lang].form.login}
        </Link>
      </div>
    </div>
  );
};

export default RegisterPage;

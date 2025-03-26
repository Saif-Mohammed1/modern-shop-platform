"use client";
import { type FormEvent, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import Spinner from "../spinner/spinner";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import api from "../../app/lib/utilities/api";
import { registerTranslate } from "@/public/locales/client/(public)/auth/registerTranslate";
import { lang } from "../../app/lib/utilities/lang";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // const params = useSearchParams();
  // const callbackUrl = params.get("callbackUrl");
  const router = useRouter();
  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      toast.error(
        registerTranslate[lang].functions.handleRegister.requiredFields
      );
      return;
    }
    if (password !== confirmPassword) {
      toast.error(
        registerTranslate[lang].functions.handleRegister.passwordsDoNotMatch
      );
      return;
    }
    setIsLoading(true);
    try {
      await api.post("/auth/register", {
        name,
        email,
        password,
        confirmPassword,
      });
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false, // Important: Prevent automatic redirect on failure

        // redirect: callbackUrl ? true : false,
        // callbackUrl: callbackUrl || "/",
      });
      if (result?.error) {
        throw new Error(result.error);
      }
      router.back(); // Go back to previous page (closes modal)
      router.replace("/");

      toast.success(registerTranslate[lang].functions.handleRegister.success);
      setEmail("");
      setName("");
      setPassword("");
      setConfirmPassword("");
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(
          error.message ||
            registerTranslate[lang].functions.handleRegister.error
        );
      } else {
        toast.error(registerTranslate[lang].functions.handleRegister.error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
        {registerTranslate[lang].form.title}
      </h2>
      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-gray-600">
            {registerTranslate[lang].form.name.label}
          </label>
          <input
            type="text"
            value={name}
            placeholder={registerTranslate[lang].form.name.placeholder}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-gray-600">
            {registerTranslate[lang].form.email.label}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder={registerTranslate[lang].form.email.placeholder}
            className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-gray-600">
            {registerTranslate[lang].form.password.label}
          </label>
          <div className="flex  relative items-center">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder={registerTranslate[lang].form.password.placeholder}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-2 flex items-center font-medium text-lg cursor-pointer text-gray-500"
            >
              {showPassword ? <AiFillEye /> : <AiFillEyeInvisible />}
            </span>
          </div>
        </div>
        <div>
          <label className="block text-gray-600">
            {registerTranslate[lang].form.confirmPassword.label}
          </label>
          <div className="flex  relative items-center">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="password"
              placeholder={
                registerTranslate[lang].form.confirmPassword.placeholder
              }
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <span
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-2 flex items-center font-medium text-lg cursor-pointer text-gray-500"
            >
              {showConfirmPassword ? <AiFillEye /> : <AiFillEyeInvisible />}
            </span>
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors"
          disabled={isLoading}
        >
          {isLoading ? <Spinner /> : registerTranslate[lang].form.submit}
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

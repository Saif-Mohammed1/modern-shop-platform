// import { redirect } from "next/navigation";
// import api from "../../app/lib/utilities/api";
// import { resetPasswordTranslate } from "@/public/locales/client/(public)/auth/resetPasswordTranslate";
// import { lang } from "@/app/lib/utilities/lang";

// type Props = {
//   email: string;
//   token: string;
//   searchParams?: {
//     error?: string;
//     success?: string;
//   };
// };

// async function handleResetPassword(formData: FormData) {
//   "use server";

//   const token = formData.get("token");
//   const email = formData.get("email");
//   const newPassword = formData.get("newPassword");
//   const confirmPassword = formData.get("confirmPassword");

//   // Basic validation
//   if (newPassword !== confirmPassword) {
//     redirect("/auth/reset-password?error=passwords_mismatch");
//   }

//   try {
//     await api.post("/auth/reset-password", {
//       token,
//       newPassword,
//       confirmPassword,
//     });
//     redirect("/auth");
//   } catch (error) {
//     redirect("/auth/reset-password?error=reset_failed");
//   }
// }

// const ResetPasswordPage = ({ email, token, searchParams }: Props) => {
//   const errorMessage = searchParams?.error
//     ? resetPasswordTranslate[lang].errors[searchParams.error]
//     : null;

//   const successMessage = searchParams?.success
//     ? resetPasswordTranslate[lang].success[searchParams.success]
//     : null;

//   return (
//     <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
//       <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
//         {resetPasswordTranslate[lang].form.title}
//       </h2>

//       {/* Display Messages */}
//       {errorMessage && <div className="mb-4 text-red-500">{errorMessage}</div>}
//       {successMessage && (
//         <div className="mb-4 text-green-500">{successMessage}</div>
//       )}

//       <form action={handleResetPassword} className="space-y-4">
//         <input type="hidden" name="token" value={token} />
//         <input type="hidden" name="email" value={email} />

//         <div>
//           <label className="block text-gray-600">
//             {resetPasswordTranslate[lang].form.newPassword.label}
//           </label>
//           <input
//             type="password"
//             name="newPassword"
//             placeholder={
//               resetPasswordTranslate[lang].form.newPassword.placeholder
//             }
//             required
//             className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
//           />
//         </div>

//         <div>
//           <label className="block text-gray-600">
//             {resetPasswordTranslate[lang].form.confirmPassword.label}
//           </label>
//           <input
//             type="password"
//             name="confirmPassword"
//             placeholder={
//               resetPasswordTranslate[lang].form.confirmPassword.placeholder
//             }
//             required
//             className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
//           />
//         </div>

//         <button
//           type="submit"
//           className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors"
//         >
//           {resetPasswordTranslate[lang].form.submitButton}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default ResetPasswordPage;
import { redirect } from "next/navigation";
import api from "../../app/lib/utilities/api";
import { resetPasswordTranslate } from "@/public/locales/client/(public)/auth/resetPasswordTranslate";
import { lang } from "@/app/lib/utilities/lang";
import { z } from "zod";
import { userZodValidatorTranslate } from "@/public/locales/server/userControllerTranslate";
import SubmitButton from "../ui/SubmitButton";

// 🔹 Define Zod Schema for Validation
// const resetPasswordSchema = z
//   .object({
//     token: z.string().min(1, "Invalid token"),
//     email: z.string().email("Invalid email"),
//     newPassword: z
//       .string()
//       .min(8, "Password must be at least 8 characters")
//       .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
//       .regex(/[a-z]/, "Password must contain at least one lowercase letter")
//       .regex(/[0-9]/, "Password must contain at least one number"),
//     confirmPassword: z.string(),
//   })
//   .refine((data) => data.newPassword === data.confirmPassword, {
//     message: "Passwords do not match",
//     path: ["confirmPassword"],
//   });
const resetPasswordSchema = z
  .object({
    // token: z.string({
    //   required_error: userZodValidatorTranslate[lang].token.required,
    // }),
    // email: z
    //   .string({
    //     required_error: userZodValidatorTranslate[lang].email.required,
    //   })
    //   .email(userZodValidatorTranslate[lang].email.invalid),
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
type Props = {
  email: string;
  token: string;
  error?: string;
};

async function handleResetPassword(formData: FormData) {
  "use server";

  // Extract form data
  const data = {
    token: formData.get("token") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  // 🔹 Validate using Zod
  const result = resetPasswordSchema.safeParse(data);
  if (!result.success) {
    const firstError = result.error.errors[0]?.message || "Validation failed";
    return redirect(
      `/auth/reset-password?email=${data.email}&token=${
        data.token
      }&error=${encodeURIComponent(firstError)}`
    );
  }
  let redirectPath: string | null = null;
  try {
    await api.post("/auth/reset-password", {
      email: data.email,
      confirmPassword: data.confirmPassword,
      token: data.token,
      password: data.password,
    });

    redirectPath = "/auth";
    // redirect("/auth/");
  } catch (error) {
    redirectPath = `/auth/reset-password?email=${data.email}&token=${data.token}&error=${encodeURIComponent((error as any)?.message)}`;
    // redirect(
    //   `/auth/reset-password?email=${data.email}&token=${
    //     data.token
    //   }&error=${encodeURIComponent((error as any)?.message)}`
    // );
  } finally {
    if (redirectPath) redirect(redirectPath);
  }
}

const ResetPasswordPage = ({ email, token, error }: Props) => {
  // const errorMessage = searchParams?.error
  //   ? resetPasswordTranslate[lang].errors[searchParams.error] ||
  //     searchParams.error
  //   : null;

  // const successMessage = searchParams?.success
  //   ? resetPasswordTranslate[lang].success[searchParams.success]
  //   : null;

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
        {resetPasswordTranslate[lang].form.title}
      </h2>

      {/* Display Messages */}
      {error && <div className="mb-4 text-red-500">{error}</div>}
      {/* {successMessage && (
        <div className="mb-4 text-green-500">{successMessage}</div>
      )} */}

      <form action={handleResetPassword} className="space-y-4">
        <input type="hidden" name="token" value={token} />
        <input type="hidden" name="email" value={email} />
        <div>
          <label className="block text-gray-600">
            {resetPasswordTranslate[lang].form.newPassword.label}
          </label>
          <input
            type="password"
            name="password"
            placeholder={
              resetPasswordTranslate[lang].form.newPassword.placeholder
            }
            required
            className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-gray-600">
            {resetPasswordTranslate[lang].form.confirmPassword.label}
          </label>
          <input
            type="password"
            name="confirmPassword"
            placeholder={
              resetPasswordTranslate[lang].form.confirmPassword.placeholder
            }
            required
            className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        {/* <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors"
        >
          {resetPasswordTranslate[lang].form.submitButton}
        </button> */}
        <SubmitButton title={resetPasswordTranslate[lang].form.submitButton} />
      </form>
    </div>
  );
};

export default ResetPasswordPage;

"use client";

import { gql, useMutation } from "@apollo/client";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import toast from "react-hot-toast";
import {
  FiCheckSquare,
  FiDollarSign,
  FiGlobe,
  FiLock,
  FiMail,
  FiPhone,
  FiUser,
} from "react-icons/fi";
import validator from "validator";
import { z } from "zod";

import { type ClientAuditLogDetails } from "@/app/lib/types/audit.db.types";
import {
  AuthMethod,
  type UserAuthType,
  UserRole,
  UserStatus,
} from "@/app/lib/types/users.db.types";
import { lang } from "@/app/lib/utilities/lang";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { usersTranslate } from "@/public/locales/client/(auth)/(admin)/dashboard/usersTranslate";

// GraphQL Mutation
const CREATE_USER_BY_ADMIN = gql`
  mutation CreateUserByAdmin($input: CreateUserByAdminInput!) {
    createUserByAdmin(input: $input) {
      _id
      name
      email
      phone
      role
      status
      created_at
      verification {
        email_verified
        phone_verified
      }
      two_factor_enabled
      login_notification_sent
      security {
        auditLog {
          action
          timestamp
          details {
            success
            message
            device {
              fingerprint
              device
              os
              browser
              ip
              location {
                city
                country
                latitude
                longitude
              }
              is_bot
            }
          }
        }
      }
    }
  }
`;

// GraphQL response type
interface CreateUserResponse {
  createUserByAdmin: UserAuthType & {
    security: {
      auditLog: ClientAuditLogDetails[];
    };
  };
}

const userSchema = z.object({
  name: z
    .string({
      required_error:
        usersTranslate.users[lang].addUsers.form.error.nameRequired,
    })
    .min(8, usersTranslate.users[lang].addUsers.form.error.nameTooSmall)
    .max(50, usersTranslate.users[lang].addUsers.form.error.nameTooLong),
  email: z
    .string()
    .email(usersTranslate.users[lang].addUsers.form.error.invalidEmail)
    .transform((val) => val.toLowerCase()),
  phone: z
    .string()
    .refine(
      (val) => !val || validator.isMobilePhone(val),
      usersTranslate.users[lang].addUsers.form.error.invalidPhone
    )
    .optional(),
  password: z
    .string()
    .refine(
      (val) => val.length >= 10 && val.length <= 40,
      usersTranslate.users[lang].addUsers.form.error.passwordLength
    )
    .refine(
      (val) => /[A-Z]/.test(val),
      usersTranslate.users[lang].addUsers.form.error.passwordUppercase
    )
    .refine(
      (val) => /[a-z]/.test(val),
      usersTranslate.users[lang].addUsers.form.error.passwordLowercase
    )
    .refine(
      (val) => /\d/.test(val),
      usersTranslate.users[lang].addUsers.form.error.passwordNumber
    )
    .refine(
      (val) => /[@$!%*?&]/.test(val),
      usersTranslate.users[lang].addUsers.form.error.passwordSpecial
    ),
  role: z.nativeEnum(UserRole),
  status: z.nativeEnum(UserStatus),
  authMethods: z
    .array(z.nativeEnum(AuthMethod))
    .min(1, usersTranslate.users[lang].addUsers.form.error.authMethodRequired),
  preferences: z.object({
    language: z.enum(["en", "uk"]), // "es", "fr", "de",
    currency: z.enum(["USD", "EUR", "GBP", "UAH"]),
    marketingOptIn: z.boolean(),
  }),
});

type UserFormValues = z.infer<typeof userSchema>;

const AddUser = () => {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [formData, setFormData] = useState<UserFormValues>({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: UserRole.CUSTOMER,
    status: UserStatus.ACTIVE,
    authMethods: [AuthMethod.EMAIL],
    preferences: {
      language: "uk",
      currency: "UAH",
      marketingOptIn: false,
    },
  });

  // GraphQL Mutation
  const [createUserByAdmin, { loading: isSubmitting }] =
    useMutation<CreateUserResponse>(CREATE_USER_BY_ADMIN, {
      onCompleted: (data) => {
        if (data?.createUserByAdmin) {
          toast.success(
            usersTranslate.users[lang].addUsers.function.handleSubmit.success
          );
          router.push(`/dashboard/users?email=${formData.email}`);
        }
      },
      onError: (error) => {
        toast.error(error.message || usersTranslate.users[lang].error.global);
      },
    });

  const handleInputChange = (name: string, value: any) => {
    setFormData((prev) => {
      if (name.startsWith("preferences.")) {
        const prefField = name.split(".")[1] as keyof typeof prev.preferences;
        return {
          ...prev,
          preferences: {
            ...prev.preferences,
            [prefField]: value,
          },
        };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const validationResult = userSchema.safeParse(formData);
      if (!validationResult.success) {
        const errors = validationResult.error.errors.reduce<
          Record<string, string[]>
        >((acc, err) => {
          const fieldName = err.path[0];
          if (fieldName) {
            if (!acc[fieldName]) {
              acc[fieldName] = [];
            }
            acc[fieldName].push(err.message);
          }
          return acc;
        }, {});

        setErrors(errors);
        return;
      }

      // Handle valid form submission
      setErrors({});

      // Prepare mutation input
      const mutationInput = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        ...(formData.phone &&
          formData.phone !== "" && { phone: formData.phone }),
        role: formData.role,
        status: formData.status,
        authMethods: formData.authMethods,
        preferences: {
          language: formData.preferences.language,
          currency: formData.preferences.currency,
          marketingOptIn: formData.preferences.marketingOptIn,
        },
      };

      // Execute GraphQL mutation
      await createUserByAdmin({
        variables: {
          input: mutationInput,
        },
      });
    } catch (error: unknown) {
      toast.error(
        (error as Error)?.message || usersTranslate.users[lang].error.global
      );
    }
  };

  return (
    <div className="container mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">
        {usersTranslate.users[lang].addUsers.title}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Name Field */}
          <Input
            icon={<FiUser />}
            name="name"
            value={formData.name}
            placeholder={
              usersTranslate.users[lang].addUsers.form.name.placeholder
            }
            onChange={(e) => {
              handleInputChange("name", e.target.value);
            }}
            required
            error={errors.name}
          />

          {/* Email Field */}
          <Input
            icon={<FiMail />}
            type="email"
            name="email"
            value={formData.email}
            placeholder={
              usersTranslate.users[lang].addUsers.form.email.placeholder
            }
            onChange={(e) => {
              handleInputChange("email", e.target.value);
            }}
            required
            error={errors.email}
          />

          {/* Password Field */}
          <Input
            icon={<FiLock />}
            type="password"
            name="password"
            value={formData.password}
            placeholder={
              usersTranslate.users[lang].addUsers.form.password.placeholder
            }
            onChange={(e) => {
              handleInputChange("password", e.target.value);
            }}
            required
            error={errors.password}
          />

          {/* Phone Field */}
          <Input
            icon={<FiPhone />}
            type="tel"
            name="phone"
            value={formData.phone ?? ""}
            placeholder={
              usersTranslate.users[lang].addUsers.form.phone.placeholder
            }
            onChange={(e) => {
              handleInputChange("phone", e.target.value);
            }}
            error={errors.name}
          />

          {/* Role Selector */}
          <Select
            options={Object.values(UserRole).map((role) => ({
              value: role,
              label: usersTranslate.users[lang].addUsers.form.roles[role],
            }))}
            value={formData.role}
            onChange={(e) => {
              handleInputChange("role", e.target.value);
            }}
            placeholder={usersTranslate.users[lang].addUsers.form.role.label}
            icon={<FiUser />}
          />

          {/* Status Selector */}
          <Select
            options={Object.values(UserStatus).map((status) => ({
              value: status,
              label: usersTranslate.users[lang].addUsers.form.statuses[status],
            }))}
            value={formData.status}
            onChange={(e) => {
              handleInputChange("status", e.target.value);
            }}
            placeholder={usersTranslate.users[lang].addUsers.form.status.label}
            icon={<FiCheckSquare />}
          />

          {/* Auth Methods */}
          <div className="space-y-2 col-span-2">
            <label className="block text-sm font-medium mb-2">
              {usersTranslate.users[lang].addUsers.form.authMethods.label}
            </label>
            <div className="flex flex-wrap gap-4">
              {Object.values(AuthMethod).map((method) => (
                <label key={method} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.authMethods.includes(method)}
                    onChange={(e) => {
                      const methods = e.target.checked
                        ? [...formData.authMethods, method]
                        : formData.authMethods.filter((m) => m !== method);
                      handleInputChange("authMethods", methods);
                    }}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  {usersTranslate.users[lang].addUsers.form.authMethods[method]}
                </label>
              ))}
            </div>
          </div>

          {/* Preferences Section */}
          <div className="space-y-4 col-span-2 border-t pt-4">
            <h3 className="text-lg font-medium">
              {usersTranslate.users[lang].addUsers.form.preferences.title}
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              <Select
                options={(
                  ["en", "uk"] as Array<keyof typeof usersTranslate.users>
                ).map((lg) => ({
                  value: lg,
                  label:
                    usersTranslate.users[lg].addUsers.form.preferences
                      .languages[lg],
                }))}
                value={formData.preferences.language}
                onChange={(e) => {
                  handleInputChange("preferences.language", e.target.value);
                }}
                placeholder={
                  usersTranslate.users[lang].addUsers.form.preferences
                    .languageLabel
                }
                icon={<FiGlobe />}
              />

              <Select
                options={(["USD", "EUR", "GBP", "UAH"] as const).map(
                  (currency) => ({
                    value: currency,
                    label:
                      usersTranslate.users[lang].addUsers.form.preferences
                        .currencies[currency],
                  })
                )}
                value={formData.preferences.currency}
                onChange={(e) => {
                  handleInputChange("preferences.currency", e.target.value);
                }}
                placeholder={
                  usersTranslate.users[lang].addUsers.form.preferences
                    .currencyLabel
                }
                icon={<FiDollarSign />}
              />

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.preferences.marketingOptIn}
                  onChange={(e) => {
                    handleInputChange(
                      "preferences.marketingOptIn",
                      e.target.checked
                    );
                  }}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                />
                {
                  usersTranslate.users[lang].addUsers.form.preferences
                    .marketingLabel
                }
              </label>
            </div>
          </div>
        </div>
        <Button
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50"
          loading={isSubmitting}
          disabled={isSubmitting}
          // title={
          //   // isSubmitting
          //   //   ? usersTranslate.users[lang].button.saving
          //   //   : usersTranslate.users[lang].button.addUser
          // }
        >
          {usersTranslate.users[lang].button.addUser}
        </Button>

        {/* <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {isSubmitting
            ? usersTranslate.users[lang].addUsers.saving
            : usersTranslate.users[lang].button.addUser}
        </button> */}
      </form>
    </div>
  );
};

export default AddUser;

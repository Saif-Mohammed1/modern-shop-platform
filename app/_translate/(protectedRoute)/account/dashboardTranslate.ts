// File: dashboardTranslate.ts
export const accountDashboardTranslate = {
  en: {
    metadata: {
      title: "Dashboard",
      description: "Dashboard for the customer",
      keywords: "customer, dashboard, customer dashboard",
    },
    title: "Account Settings",
    functions: {
      handleApplyChanges: {
        loading: "Applying changes...",
        success: "Changes applied successfully!",
        error: "Failed to apply changes!",
      },
      handleSendVerificationLink: {
        loading: "Sending verification link...",
        success: "Email verification link sent!",
        error: "Failed to send verification link!",
      },
      handleVerifyToken: {
        loading: "Sending verification link...",
        success: "Email verified successfully!",
        error: "Failed to verify Email!",
      },
      handleEmailChange: {
        loading: "Changing email...",
        success:
          "we have sent you a verification link to your old email please check it for confirmation",
        error: "Failed to change email!",
      },
    },
    form: {
      name: {
        label: "Name",
        placeholder: "Enter name",
      },
      email: {
        label: "Email",
        placeholder: "Enter email",
        verified: "(verified)",
        notVerified: "(not verified)",
      },
      verificationToken: {
        label: "Enter Verification Token",
        placeholder: "Enter Verification Token",
      },

      phone: {
        label: "Mobile Number",
        placeholder: "Enter mobile number",
      },
    },
    button: {
      isEdit: {
        cancel: "Cancel",
        edit: "Edit",
      },
      save: "Save",
      update: "Update",
      verifyEmail: "Verify Email",
      sendVerificationLink: "Send Verification Link",
      applyChanges: "Apply Changes",
    },
    errors: {
      global: "something went wrong please try again later",
    },
  },
  uk: {
    metadata: {
      title: "Панель",
      description: "Панель для клієнта",
      keywords: "клієнт, панель, панель клієнта",
    },
    title: "Налаштування облікового запису",
    functions: {
      handleApplyChanges: {
        loading: "Застосування змін...",
        success: "Зміни успішно застосовано!",
        error: "Не вдалося застосувати зміни!",
      },
      handleSendVerificationLink: {
        loading: "Відправка посилання для підтвердження...",
        success: "Посилання для підтвердження електронної пошти відправлено!",
        error: "Не вдалося відправити посилання для підтвердження!",
      },
      handleVerifyToken: {
        loading: "Відправка посилання для підтвердження...",
        success: "Електронна пошта успішно підтверджена!",
        error: "Не вдалося підтвердити електронну пошту!",
      },
      handleEmailChange: {
        loading: "Зміна електронної пошти...",
        success:
          "ми відправили вам посилання для підтвердження на вашу стару електронну пошту, будь ласка, перевірте її для підтвердження",
        error: "Не вдалося змінити електронну пошту!",
      },
    },
    form: {
      name: {
        label: "Ім'я",
        placeholder: "Введіть ім'я",
      },
      email: {
        label: "Електронна пошта",
        placeholder: "Введіть електронну пошту",
        verified: "(підтверджено)",
        notVerified: "(не підтверджено)",
      },
      verificationToken: {
        label: "Введіть токен підтвердження",
        placeholder: "Введіть токен підтвердження",
      },
      phone: {
        label: "Мобільний номер",
        placeholder: "Введіть мобільний номер",
      },
    },
    button: {
      isEdit: {
        cancel: "Скасувати",
        edit: "Редагувати",
      },
      save: "Зберегти",

      update: "Оновити",
      verifyEmail: "Підтвердити електронну пошту",
      sendVerificationLink: "Відправити посилання для підтвердження",
      applyChanges: "Застосувати зміни",
    },
    errors: {
      global: "щось пішло не так, спробуйте пізніше",
    },
  },
} as const;

const addUsers = {
  en: {
    metadata: {
      title: "Add User",
      description: "Add user for the admin",
      keywords: "admin, add user, admin add user",
    },
    title: "Add New User",

    form: {
      error: {
        nameRequired: "Name is required",
        nameTooSmall: "Name  must be at least 8 characters",
        nameTooLong: "Name cannot exceed 50 characters",
        invalidEmail: "Invalid email address",
        invalidPhone: "Invalid phone number",
        passwordLength: "Password must be 10-40 characters",
        passwordUppercase: "Requires uppercase letter",
        passwordLowercase: "Requires lowercase letter",
        passwordNumber: "Requires number",
        passwordSpecial: "Requires special character",
        authMethodRequired: "Select at least one auth method",
      },
      roles: {
        customer: "Customer",
        admin: "Administrator",
        moderator: "Moderator",
      },
      statuses: {
        active: "Active",
        inactive: "Inactive",
        suspended: "Suspended",
        deleted: "Deleted",
      },
      authMethods: {
        label: "Authentication Methods",
        email: "Email",
        google: "Google",
        facebook: "Facebook",
        apple: "Apple",
      },
      preferences: {
        title: "User Preferences",
        languageLabel: "Select Language",
        currencyLabel: "Select Currency",
        marketingLabel: "Receive marketing communications",
        languages: {
          en: "English",
          es: "Spanish",
          fr: "French",
          de: "German",
          uk: "Ukrainian",
        },
        currencies: {
          USD: "US Dollar",
          EUR: "Euro",
          GBP: "British Pound",
          UAH: "Ukrainian Hryvnia",
        },
      },
      status: {
        label: "Status",
      },
      phone: {
        label: "Phone",
        placeholder: "Enter phone number",
      },
      name: {
        label: "Name",
        placeholder: "Enter name",
      },
      email: {
        label: "Email",
        placeholder: "Enter email",
      },
      password: {
        label: "Password",
        placeholder: "Enter password",
      },
      role: {
        label: "Role",
        options: {
          customer: "Customer",
          admin: "Administrator",
          moderator: "Moderator",
        },
      },
      active: {
        label: "Active",
      },
    },

    function: {
      handleSubmit: {
        loading: "Adding user...",
        success: "User added successfully",
        canceled: "Add user canceled",
      },
    },
  },

  uk: {
    metadata: {
      title: "Додати користувача",
      description: "Додати користувача для адміністратора",
      keywords:
        "адміністратор, додати користувача, адміністратор додати користувача",
    },
    title: "Додати нового користувача",

    form: {
      error: {
        nameRequired: "Ім'я обов'язкове",
        nameTooSmall: "Ім'я повинно містити принаймні 8 символів",
        nameTooLong: "Ім'я не може перевищувати 50 символів",
        invalidEmail: "Недійсна адреса електронної пошти",
        invalidPhone: "Недійсний номер телефону",
        passwordLength: "Пароль повинен містити від 10 до 40 символів",
        passwordUppercase: "Потрібна велика літера",
        passwordLowercase: "Потрібна мала літера",
        passwordNumber: "Потрібна цифра",
        passwordSpecial: "Потрібен спеціальний символ",
        authMethodRequired: "Виберіть принаймні один метод автентифікації",
      },
      roles: {
        customer: "Клієнт",
        admin: "Адміністратор",
        moderator: "Модератор",
      },
      statuses: {
        active: "Активний",
        inactive: "Неактивний",
        suspended: "Призупинено",
        deleted: "Видалено",
      },
      authMethods: {
        label: "Методи автентифікації",
        email: "Електронна пошта",
        google: "Google",
        facebook: "Facebook",
        apple: "Apple",
      },

      preferences: {
        title: "Налаштування користувача",
        languageLabel: "Виберіть мову",
        currencyLabel: "Виберіть валюту",
        marketingLabel: "Отримувати маркетингові комунікації",
        languages: {
          en: "Англійська",
          es: "Іспанська",
          fr: "Французька",
          de: "Німецька",
          uk: "Українська",
        },
        currencies: {
          USD: "Долар США",
          EUR: "Євро",
          GBP: "Британський фунт",
          UAH: "Українська гривня",
        },
      },
      status: {
        label: "Статус",
      },
      phone: {
        label: "Телефон",
        placeholder: "Введіть номер телефону",
      },
      name: {
        label: "Ім'я",
        placeholder: "Введіть ім'я",
      },
      email: {
        label: "Електронна пошта",
        placeholder: "Введіть електронну пошту",
      },
      password: {
        label: "Пароль",
        placeholder: "Введіть пароль",
      },
      role: {
        label: "Роль",
        options: {
          customer: "Користувач",
          moderator: "Модератор",
          admin: "Адміністратор",
        },
      },
      active: {
        label: "Активний",
      },
    },

    function: {
      handleSubmit: {
        loading: "Додавання користувача...",
        success: "Користувач успішно доданий",
        canceled: "Додавання користувача скасовано",
      },
    },
  },
} as const;
const editUsers = {
  en: {
    metadata: {
      title: "Edit User",
      description: "Edit user for the admin",
      keywords: "admin, edit user, admin edit user",
    },
    title: "Edit User",
    account: "Account Management",
    form: {
      name: {
        label: "Name",
        placeholder: "Enter name",
      },
      email: {
        label: "Email",
        placeholder: "Enter email",
      },
      password: {
        label: "Password",
        placeholder: "Enter password",
      },
      role: {
        label: "Role",
        options: {
          customer: "Customer",
          admin: "Administrator",
          moderator: "Moderator",
        },
      },
      statuses: {
        active: "Active",
        inactive: "Inactive",
        suspended: "Suspended",
        deleted: "Deleted",
      },
      authMethods: {
        label: "Authentication Methods",
        email: "Email",
        google: "Google",
        facebook: "Facebook",
        apple: "Apple",
      },

      active: {
        label: "Active",
      },
      success: "User updated successfully",
      canceled: "update user canceled",
      failed: "Failed to update user",
      save: "Save Changes",
      NoDeviceInfo: "No device info",
    },
    sections: {
      security: "Security",
    },
    handleSecurityAction: {
      forcePasswordReset: {
        label: "Force Password Reset",
        success: "Password reset forced successfully",
        error: "Failed to force password reset",
      },
      revokeSessions: {
        label: "Revoke Sessions",
        success: "Sessions revoked successfully",
        error: "Failed to revoke sessions",
      },
      lockAccount: {
        label: "Lock Account",
        success: "Account locked successfully",
        error: "Failed to lock account",
      },
      unlockAccount: {
        label: "Unlock Account",
        success: "Account unlocked successfully",
        error: "Failed to unlock account",
      },
      advancedSettings: {
        label: "Advanced Settings",
      },
    },
    actions: {
      deleteAccount: "Delete Account",
      deleteConfirm: "Are you sure you want to delete this account?",
      deleteLoading: "Deleting account...",
    },

    function: {
      handleSubmit: {
        loading: "Updating user...",
        success: "User updated successfully",
        canceled: "update user canceled",
      },
    },
    handleDeleteUser: {
      confirm: "Are you sure you want to delete this user?",
      loading: "deleting user...",
      success: "user deleted successfully",
      canceled: "delete canceled",
      failed: "Failed to delete user",
    },
    auditLog: {
      sections: {
        title: "Audit Log",
        timestamp: "Timestamp",
        action: "Action",
        details: "Details",
      },
    },
  },

  uk: {
    metadata: {
      title: "Редагувати користувача",
      description: "Редагувати користувача для адміністратора",
      keywords:
        "адміністратор, редагувати користувача, адміністратор редагувати користувача",
    },
    title: "Редагувати користувача",
    account: "Управління обліковим записом",
    form: {
      name: {
        label: "Ім'я",
        placeholder: "Введіть ім'я",
      },
      email: {
        label: "Електронна пошта",
        placeholder: "Введіть електронну пошту",
      },
      password: {
        label: "Пароль",
        placeholder: "Введіть пароль",
      },
      role: {
        label: "Роль",
        options: {
          customer: "Клієнт",
          admin: "Адміністратор",
          moderator: "Модератор",
        },
      },
      statuses: {
        active: "Активний",
        inactive: "Неактивний",
        suspended: "Призупинено",
        deleted: "Видалено",
      },
      authMethods: {
        label: "Методи автентифікації",
        email: "Електронна пошта",
        google: "Google",
        facebook: "Facebook",
        apple: "Apple",
      },
      active: {
        label: "Активний",
      },
      success: "Користувач успішно оновлений",
      canceled: "оновлення користувача скасовано",
      failed: "Не вдалося оновити користувача",
      save: "Зберегти зміни",
      NoDeviceInfo: "Немає інформації про пристрій",
    },

    sections: {
      security: "Безпека",
    },
    handleSecurityAction: {
      forcePasswordReset: {
        label: "Примусове скидання пароля",
        success: "Скидання пароля примусово пройшло успішно",
        error: "Не вдалося примусово скинути пароль",
      },
      revokeSessions: {
        label: "Відкликати сесії",
        success: "Сесії успішно відкликані",
        error: "Не вдалося відкликати сесії",
      },
      lockAccount: {
        label: "Заблокувати обліковий запис",
        success: "Обліковий запис успішно заблоковано",
        error: "Не вдалося заблокувати обліковий запис",
      },
      unlockAccount: {
        label: "Розблокувати обліковий запис",
        success: "Обліковий запис успішно розблоковано",
        error: "Не вдалося розблокувати обліковий запис",
      },
      advancedSettings: {
        label: "Розширені налаштування",
      },
    },
    handleDeleteUser: {
      confirm: "Ви впевнені, що хочете видалити цього користувача?",
      loading: "видалення користувача...",
      success: "користувач успішно видалений",
      canceled: "видалення скасовано",
      failed: "Не вдалося видалити користувача",
    },

    actions: {
      deleteAccount: "Видалити обліковий запис",
      deleteConfirm: "Ви впевнені, що хочете видалити цей обліковий запис?",
      deleteLoading: "Видалення облікового запису...",
    },
    function: {
      handleSubmit: {
        loading: "Оновлення користувача...",
        success: "Користувач успішно оновлений",
        canceled: "оновлення користувача скасовано",
      },
    },
    auditLog: {
      sections: {
        title: "Журнал аудиту",
        timestamp: "Мітка часу",
        action: "Дія",
        details: "Деталі",
      },
    },
  },
} as const;

export const usersTranslate = {
  metadata: {
    en: {
      title: "Users",
      description: "Users management for the admin",
      keywords: "admin, users, admin users",
    },
    uk: {
      title: "Користувачі",
      description: "Управління користувачами для адміністратора",
      keywords: "адміністратор, користувачі, адміністратор користувачі",
    },
  },
  users: {
    en: {
      functions: {
        handleDelete: {
          confirm: "Are you sure you want to delete this user?",
          loading: "deleting user...",
          success: "user deleted successfully",
          canceled: "delete canceled",
        },
      },
      filter: {
        search: {
          placeholder: "Search by email",
        },
        select: {
          role: {
            title: "Filter by Role",
            options: {
              customer: "Customer",
              admin: "Administrator",
              moderator: "Moderator",
            },
          },
          activity: {
            all: "All",
            title: "Filter by Activity",
            options: {
              active: "Active",
              inactive: "Inactive",
            },
          },
        },
      },
      details: {
        title: "Manage Users",
        thead: {
          name: "Name",
          email: "Email",
          role: "Role",
          status: "Status",
          actions: "Actions",
        },
      },
      addUsers: addUsers.en,
      editUsers: editUsers.en,
      button: {
        addUsers: "Add New User",
        delete: "Delete",
        edit: "Edit",
        addUser: "Add User",
        saving: "Saving",
        updateUser: "Update User",
      },
      error: {
        global: "something went wrong",
        emptyFields: "Please fill in all fields",
      },
    },
    uk: {
      functions: {
        handleDelete: {
          confirm: "Ви впевнені, що хочете видалити цього користувача?",
          loading: "видалення користувача...",
          success: "користувач успішно видалений",
          canceled: "видалення скасовано",
        },
      },
      filter: {
        search: {
          placeholder: "Пошук за електронною поштою",
        },
        select: {
          role: {
            title: "Фільтрувати за роллю",
            options: {
              customer: "Клієнт",
              admin: "Адміністратор",
              moderator: "Модератор",
            },
          },
          activity: {
            all: "всі",
            title: "Фільтрувати за активністю",
            options: {
              active: "Активний",
              inactive: "Неактивний",
            },
          },
        },
      },
      details: {
        title: "Управління користувачами",
        thead: {
          name: "Ім'я",
          email: "Електронна пошта",
          role: "Роль",
          status: "Статус",
          actions: "Дії",
        },
      },
      addUsers: addUsers.uk,
      editUsers: editUsers.uk,

      button: {
        addUsers: "Додати нового користувача",
        delete: "Видалити",
        edit: "Редагувати",
        addUser: "Додати користувача",
        saving: "Збереження",
        updateUser: "Оновити користувача",
      },
      error: {
        global: "щось пішло не так",
        emptyFields: "Будь ласка, заповніть всі поля",
      },
    },
  },
} as const;

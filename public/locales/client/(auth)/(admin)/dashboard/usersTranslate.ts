const addUsers = {
  en: {
    metadata: {
      title: "Add User",
      description: "Add user for the admin",
      keywords: "admin, add user, admin add user",
    },
    title: "Add New User",

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
          user: "User",
          seller: "Seller",
          admin: "Admin",
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
          user: "Користувач",
          seller: "Продавець",
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
          user: "User",
          seller: "Seller",
          admin: "Admin",
        },
      },
      active: {
        label: "Active",
      },
    },
    function: {
      handleSubmit: {
        loading: "Updating user...",
        success: "User updated successfully",
        canceled: "update user canceled",
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
          user: "Користувач",
          seller: "Продавець",
          admin: "Адміністратор",
        },
      },
      active: {
        label: "Активний",
      },
    },
    function: {
      handleSubmit: {
        loading: "Оновлення користувача...",
        success: "Користувач успішно оновлений",
        canceled: "оновлення користувача скасовано",
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
              user: "User",
              admin: "Admin",
            },
          },
          activity: {
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
              user: "Користувач",
              admin: "Адміністратор",
            },
          },
          activity: {
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
        updateUser: "Оновити користувача",
      },
      error: {
        global: "щось пішло не так",
        emptyFields: "Будь ласка, заповніть всі поля",
      },
    },
  },
} as const;

const deviceInfoTranslate = {
  en: {
    title: "My Devices",
    functions: {
      handleDelete: {
        loading: "Deleting device...",
        success: "Device deleted successfully",
        error: "failed to delete device",
      },
    },
    details: {
      ip: "IP Address",
      lastActive: "Last Active",
    },
    button: {
      signoutAll: "Sign out of all devices",
    },
  },
  uk: {
    title: "Мої пристрої",
    functions: {
      handleDelete: {
        loading: "Видалення пристрою...",
        success: "Пристрій успішно видалено",
        error: "не вдалося видалити пристрій",
      },
    },
    details: {
      ip: "IP адреса",
      lastActive: "Остання активність",
    },
    button: {
      signoutAll: "Вийти з усіх пристроїв",
    },
  },
} as const;
export const accountSettingsTranslate = {
  en: {
    metadata: {
      title: "Change Password",
      description: "Change Password for the customer",
      keywords: "customer, change password, customer change password",
    },
    title: "Change Password",
    functions: {
      handleDeleteAccount: {
        loading: "Deleting account...",
        success: "Account deleted successfully!",
        error: "Failed to delete account!",
      },
      handlePasswordUpdate: {
        requiredFields: "Please fill all the fields",
        passwordMismatch: "New Password and Confirm Password are not the same",
        loading: "Updating Password...",
        success:
          "Password Updated Successfully!,We recommend you to Log Out of all devices and login again",
        error: "Failed to update password!",
      },

      handleSignoutAll: {
        loading: "Signing out of all devices...",
        success: "Signed out of all devices successfully!",
        error: "Failed to sign out of all devices!",
      },
    },
    form: {
      password: {
        label: "Password",
        placeholder: "Enter your password",
      },
      oldPassword: {
        label: "Old Password",
        placeholder: "Enter your old password",
      },
      newPassword: {
        label: "New Password",
        placeholder: "Enter your new password",
      },
      confirmPassword: {
        label: "Confirm Password",
        placeholder: "Confirm your new password",
      },
    },
    showDeleteModal: {
      title: "Are you sure?",
      description: "This action cannot be undone.",
      cancel: "Cancel",
      delete: "Yes, Delete",
    },
    button: {
      cancel: "Cancel",
      change: "Change",
      update: "Update",
      deleteAccount: "Delete Account",
    },
    devices: deviceInfoTranslate.en,
    errors: {
      global: "something went wrong please try again later",
    },
  },
  uk: {
    metadata: {
      title: "Змінити пароль",
      description: "Змінити пароль для клієнта",
      keywords: "клієнт, змінити пароль, клієнт змінити пароль",
    },
    title: "Змінити пароль",
    functions: {
      handleDeleteAccount: {
        loading: "Видалення облікового запису...",
        success: "Обліковий запис успішно видалено!",
        error: "Не вдалося видалити обліковий запис!",
      },
      handlePasswordUpdate: {
        requiredFields: "Будь ласка, заповніть всі поля",
        passwordMismatch: "Новий пароль і підтвердження пароля не співпадають",
        loading: "Оновлення пароля...",
        success:
          "Пароль успішно оновлено! Ми рекомендуємо вам вийти з усіх пристроїв і увійти знову",
        error: "Не вдалося оновити пароль!",
      },
      handleSignoutAll: {
        loading: "Вихід з усіх пристроїв...",
        success: "Вихід з усіх пристроїв виконано успішно!",
        error: "Не вдалося вийти з усіх пристроїв!",
      },
    },
    form: {
      password: {
        label: "Пароль",
        placeholder: "Введіть ваш пароль",
      },
      oldPassword: {
        label: "Старий пароль",
        placeholder: "Введіть ваш старий пароль",
      },
      newPassword: {
        label: "Новий пароль",
        placeholder: "Введіть ваш новий пароль",
      },
      confirmPassword: {
        label: "Підтвердіть пароль",
        placeholder: "Підтвердіть ваш новий пароль",
      },
    },
    showDeleteModal: {
      title: "Ви впевнені?",
      description: "Ця дія не може бути скасована.",
      cancel: "Скасувати",
      delete: "Так, видалити",
    },
    button: {
      cancel: "Скасувати",
      change: "Змінити",
      update: "Оновити",
      deleteAccount: "Видалити обліковий запис",
    },
    devices: deviceInfoTranslate.uk,
    errors: {
      global: "щось пішло не так, спробуйте ще раз пізніше",
    },
  },
} as const;

export type DeviceInfoType = {
  _id: string;
  token: string;
  user: string;
  deviceInfo: string;
  ipAddress: string;
  expiresAt: string;
  createdAt: string;
  lastActiveAt: string;
};

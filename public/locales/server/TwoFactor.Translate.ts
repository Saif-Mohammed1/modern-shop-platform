export const TwoFactorTranslate = {
  en: {
    dto: {
      temToken: {
        required: 'Temporary token is required',
      },
      code: {
        required: 'Code is required',
        regex: 'Invalid code format',
      },
      ipAddress: {
        required: 'IP address is required',
        invalid: 'Invalid IP address format',
      },
      backupCode: {
        backUp: 'Backup code is required',

        min: 'Backup code must be at least  characters long',
        array: 'Only 5 backup codes are required',
      },
      userAgent: {
        required: 'User agent is required',
      },
      location: {
        country: {
          required: 'Country is required',
        },
        region: {
          required: 'Region is required',
        },
        city: {
          required: 'City is required',
        },
        timezone: {
          required: 'Timezone is required',
        },
      },
      deviceHash: {
        required: 'Device hash is required',
        invalid: 'Invalid device hash',
      },
    },
    success: {
      initialized: '2FA initialized',
      verified: '2FA verified',
      disabled: '2FA disabled',
      backupCodeRegenerated: 'Backup code regenerated',
      backupCodeUsed: 'Backup code used',
    },
    error: {
      notFoundUser: 'User not found',
      alreadyInitialized: '2FA already initialized',
      notConfigured: '2FA not configured',
      invalidToken: 'Invalid token',
      invalidVerificationCode: 'Invalid verification code',
      invalidDeviceHash: 'Invalid device hash',
      invalidBackupCode: 'Invalid backup code',
      invalidVerificationMethod: 'Invalid verification method',
      invalidPassword: 'Invalid password',
      invalidCode: 'Invalid code',
      invalidUserId: 'Invalid user ID',
      twoFactorNotEnabled: '2FA not enabled',
      duplicateCode: 'Duplicate code',
      validationFailed: 'Validation failed',
    },
    locked: (min: string) => `Account locked. Try again after ${min} minutes`,
  },
  uk: {
    dto: {
      temToken: {
        required: "Тимчасовий токен обов'язковий",
      },
      code: {
        required: "Код обов'язковий",
        regex: 'Недійсний формат коду',
      },

      ipAddress: {
        required: "IP-адреса обов'язкова",
        invalid: 'Недійсний формат IP-адреси',
      },
      backupCode: {
        backUp: "Резервний код обов'язковий",

        min: 'Резервний код повинен бути не менше  символів',
        array: 'Потрібно лише 5 резервних кодів',
      },
      userAgent: {
        required: "Ідентифікатор користувача обов'язковий",
      },
      location: {
        country: {
          required: "Країна обов'язкова",
        },
        region: {
          required: "Регіон обов'язковий",
        },
        city: {
          required: "Місто обов'язкове",
        },
        timezone: {
          required: "Часовий пояс обов'язковий",
        },
      },
      deviceHash: {
        required: "Хеш пристрою обов'язковий",
        invalid: 'Недійсний хеш пристрою',
      },
    },
    success: {
      initialized: '2FA ініціалізовано',
      verified: '2FA перевірено',
      disabled: '2FA вимкнено',
      backupCodeRegenerated: 'Резервний код відновлено',
      backupCodeUsed: 'Резервний код використано',
    },
    error: {
      notFoundUser: 'Користувач не знайдений',
      alreadyInitialized: '2FA вже ініціалізовано',
      notConfigured: '2FA не налаштовано',
      invalidToken: 'Недійсний токен',
      invalidVerificationCode: 'Недійсний код підтвердження',
      invalidDeviceHash: 'Недійсний хеш пристрою',
      invalidBackupCode: 'Недійсний резервний код',
      invalidVerificationMethod: 'Недійсний метод підтвердження',
      invalidPassword: 'Недійсний пароль',
      invalidCode: 'Недійсний код',
      invalidUserId: 'Недійсний ідентифікатор користувача',

      twoFactorNotEnabled: '2FA не ввімкнено',
      duplicateCode: 'Дублювати код',
      validationFailed: 'Перевірка не вдалася',
    },
    locked: (min: string) => `Обліковий запис заблоковано. Спробуйте ще раз через ${min} хвилин`,
  },
} as const;

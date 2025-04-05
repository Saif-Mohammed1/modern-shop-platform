export const accountTwoFactorTranslate = {
  en: {
    metadata: {
      title: 'Two-Factor Authentication',
      description: 'Two-Factor Authentication for the customer',
      keywords: 'customer, two-factor, customer two-factor',
    },
    title: 'Two-Factor Authentication',
    description:
      "Add an extra layer of security to your account. When enabled, you'll need to enter both your password and an authentication code to sign in.",
    functions: {
      handleEnable2FA: {
        loading: 'Enabling 2FA...',
        label: 'Enable 2FA',
        success: '2FA enabled successfully',
        failed: '2FA setup failed',
      },
      handleDisable2FA: {
        loading: 'Disabling 2FA...',
        label: 'Disable 2FA',
        success: '2FA disabled successfully',
        failed: '2FA disable failed',
      },
      handleVerify2FA: {
        loading: 'Verifying 2FA...',
        label: 'Verify 2FA',
        success: '2FA verified successfully',
        failed: '2FA verification failed',
      },
      handleRegenerateBackupCodes: {
        loading: 'Regenerating backup codes...',
        label: 'Regenerate Backup Codes',
        success: 'Backup codes regenerated successfully',
        failed: 'Backup code regeneration failed',
      },
      handleLoadAuditLogs: {
        loading: 'Loading audit logs...',
        label: 'Load Audit Logs',
        success: 'Audit logs loaded successfully',
        failed: 'Failed to load audit logs',
      },
      handleSetup2FA: {
        loading: 'Setting up 2FA...',
        label: 'Setup 2FA',
        success: '2FA setup completed successfully',
        failed: '2FA setup failed',
      },
      handleRecoveryManagement: {
        loading: 'Managing recovery codes...',
        label: 'Manage Recovery Codes',
        success: 'Recovery codes managed successfully',
        failed: 'Failed to manage recovery codes',
      },
      handleAuditLogViewer: {
        loading: 'Loading audit logs...',
        label: 'Load Audit Logs',
        success: 'Audit logs loaded successfully',
        failed: 'Failed to load audit logs',
      },
    },
    SecurityDashboard: {
      title: 'Two-factor authentication is active',
      SecurityCard: {
        title: 'Recovery Codes',
        description: 'Manage your backup authentication codes',
        actionText: 'View Codes',
      },
      SecurityCard2: {
        title: 'Security History',
        description: 'Review recent security events',
        actionText: 'View Logs',
      },
      button: {
        loading: 'Disabling...',
        label: 'Disable 2FA',
      },
    },
    SetupFlow: {
      title: 'Set Up Authenticator App',
      description: 'Scan the QR code with your authenticator app or enter the code manually.',
      manualEntryLabel: 'Manual Entry',
      codeDigitEnter: 'Enter the 6-digit code from your authenticator app',
      loading: 'Verifying...',
      label: 'Confirm & Enable',
    },
    BackupCodesDisplay: {
      title: 'Save these backup codes securely!',
      description:
        'These codes can be used to access your account if you lose access to your authenticator app.',
      actionText: 'Download Codes',
      continueText: 'Continue',
    },
    RecoveryManagement: {
      title: 'Recovery Codes',
      description:
        'Generating new backup codes will invalidate all previous codes. Make sure to save the new codes in a secure location.',
      generateText: 'Generate New Codes',
      confirmText: 'Confirm Regenerate',
      confirmMessage: 'Are you sure you want to generate new recovery codes?',
      cancelText: 'Cancel',
      loading: 'Generating new codes...',
    },
    AuditLogViewer: {
      title: 'Security History',
      description: 'Review recent security events',
      loading: 'Loading audit logs...',
      label: 'Load Audit Logs',
      success: 'Audit logs loaded successfully',
      failed: 'Failed to load audit logs',
    },
    TwoFactorForm: {
      title: 'Two-Factor Authentication',
      error: {
        invalidVerificationCode: 'Invalid verification code',
        invalidBackupCode: 'Invalid backup code',
      },
      TotpInput: {
        title: 'Enter the 6-digit code from your authenticator app',
        lostAccess: 'Lost access?',
        lostAccessDescription: 'Use backup codes to access your account.',
        loading: 'Verifying...',
        label: 'Verify Code',
      },
      BackupCodeInput: {
        title: 'Enter 5 backup codes. Each code can only be used once.',
        code: (num: number) => `Code ${num}`,
        loading: 'Verifying...',
        label: 'Verify Backup Code',
      },

      button: {
        backToLogin: '← Return to login',
        returnToRegular2FA: '← Return to regular 2FA',
      },
    },
  },
  uk: {
    metadata: {
      title: 'Двофакторна автентифікація',
      description: 'Двофакторна автентифікація для клієнта',
      keywords: 'клієнт, двофактор, клієнт двофактор',
    },
    title: 'Двофакторна автентифікація',
    description:
      'Додайте додатковий шар захисту до вашого облікового запису. Коли 2FA увімкнено, вам потрібно буде вводити обидві вашу пароль та код автентифікації, щоб увійти.',
    functions: {
      handleEnable2FA: {
        loading: 'Встановлення 2FA...',
        label: 'Увімкнути 2FA',
        success: '2FA успішно увімкнено',
        failed: 'Помилка встановлення 2FA',
      },
      handleDisable2FA: {
        loading: 'Вимкнення 2FA...',
        label: 'Вимкнути 2FA',
        success: '2FA успішно вимкнено',
        failed: 'Помилка вимкнення 2FA',
      },
      handleVerify2FA: {
        loading: 'Перевірка 2FA...',
        label: 'Перевірити 2FA',
        success: '2FA успішно перевірено',
        failed: 'Помилка перевірки 2FA',
      },
      handleRegenerateBackupCodes: {
        loading: 'Створення нових резервних кодів...',
        label: 'Створити резервні коди',
        success: 'Резервні коди успішно створено',
        failed: 'Помилка створення резервних кодів',
      },
      handleLoadAuditLogs: {
        loading: 'Завантаження журналу аудиту...',
        label: 'Завантажити журнал аудиту',
        success: 'Журнал аудиту успішно завантажено',
        failed: 'Помилка завантаження журналу аудиту',
      },
      handleSetup2FA: {
        loading: 'Налаштування 2FA...',
        label: 'Налаштувати 2FA',
        success: '2FA успішно налаштовано',
        failed: 'Помилка налаштування 2FA',
      },
      handleRecoveryManagement: {
        loading: 'Керування кодами відновлення...',
        label: 'Керувати кодами відновлення',
        success: 'Коди відновлення успішно оновлено',
        failed: 'Помилка керування кодами відновлення',
      },
      handleAuditLogViewer: {
        loading: 'Завантаження журналу аудиту...',
        label: 'Переглянути журнал аудиту',
        success: 'Журнал аудиту успішно завантажено',
        failed: 'Помилка завантаження журналу аудиту',
      },
    },
    SecurityDashboard: {
      title: 'Двофакторна автентифікація активна',
      SecurityCard: {
        title: 'Коди відновлення',
        description: 'Керування резервними кодами автентифікації',
        actionText: 'Переглянути коди',
      },
      SecurityCard2: {
        title: 'Історія безпеки',
        description: 'Перегляд останніх подій безпеки',
        actionText: 'Переглянути журнал',
      },
      button: {
        loading: 'Вимкнення...',
        label: 'Вимкнути 2FA',
      },
    },
    SetupFlow: {
      title: 'Налаштування додатку автентифікації',
      description: 'Відскануйте QR-код за допомогою додатку автентифікації або введіть код вручну.',
      manualEntryLabel: 'Ручне введення',
      codeDigitEnter: 'Введіть 6-значний код з вашого додатку автентифікації',
      loading: 'Перевірка...',
      label: 'Підтвердити та увімкнути',
    },
    BackupCodesDisplay: {
      title: 'Збережіть ці резервні коди надійно!',
      description:
        'Ці коди можна використовувати для доступу до вашого облікового запису, якщо ви втратите доступ до додатку автентифікації.',
      actionText: 'Завантажити коди',
      continueText: 'Продовжити',
    },
    RecoveryManagement: {
      title: 'Коди відновлення',
      description:
        "Генерація нових резервних кодів анулює всі попередні коди. Обов'язково збережіть нові коди в безпечному місці.",
      generateText: 'Згенерувати нові коди',
      confirmText: 'Підтвердити генерацію',
      confirmMessage: 'Ви впевнені, що хочете згенерувати нові коди відновлення?',
      cancelText: 'Скасувати',
      loading: 'Генерація нових кодів...',
    },
    AuditLogViewer: {
      title: 'Історія безпеки',
      description: 'Перегляд останніх подій безпеки',
      loading: 'Завантаження журналу аудиту...',
      label: 'Завантажити журнал аудиту',
      success: 'Журнал аудиту успішно завантажено',
      failed: 'Помилка завантаження журналу аудиту',
    },
    TwoFactorForm: {
      title: 'Двофакторна автентифікація',
      error: {
        invalidVerificationCode: 'Невірний код перевірки',
        invalidBackupCode: 'Невірний резервний код',
      },
      TotpInput: {
        title: 'Введіть 6-значний код з вашого додатку аутентифікації',
        lostAccess: 'Втратили доступ',
        lostAccessDescription: 'Використовуйте резервні коди для доступу до облікового запису',
        loading: 'Перевірка...',
        label: 'Перевірити код',
      },
      BackupCodeInput: {
        title: 'Введіть 5 резервних кодів. Кожен код можна використати лише один раз.',
        code: (num: number) => `Код ${num}`,
        loading: 'Перевірка...',
        label: 'Перевірити резервний код',
      },
      button: {
        backToLogin: '← Повернутися до входу',
        returnToRegular2FA: '← Повернутися до звичайної 2FA',
      },
    },
  },
} as const;

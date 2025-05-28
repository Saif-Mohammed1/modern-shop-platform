export const refreshTokenControllerTranslate = {
  en: {
    model: {
      schema: {
        user: {
          required: "User must be required",
        },
        device_info: {
          required: "DeviceInfo must be required",
        },
        ipAddress: {
          required: "IpAddress must be required",
        },

        expires_at: {
          required: "ExpiresAt must be required",
        },
      },
    },
    functions: {
      refreshAccessToken: {
        requiredFields: "Missing required fields",
      },
      verifyRefreshToken: {
        invalidRefreshToken: "Invalid refresh token",
        refreshTokenExpired: "Refresh token expired",
      },
      deleteRefreshTokenOnLogOut: {
        message: "Refresh token deleted",
      },
      deleteAllUserRefreshTokens: {
        message: "All refresh tokens deleted",
        noRefreshTokens: "No refresh tokens found",
      },
      deleteExpiredRefreshTokens: {
        message: "Expired refresh tokens deleted",
      },
      deleteSpecificUserRefreshTokens: {
        message: "Refresh token deleted",
      },
      revokeToken: {
        message: "Refresh token revoked",
      },
      revokeAllUserTokens: {
        message: "All user tokens revoked",
      },
    },
  },
  uk: {
    model: {
      schema: {
        user: {
          required: "Користувач має бути обов'язковим",
        },
        device_info: {
          required: "Інформація про пристрій має бути обов'язковою",
        },
        ipAddress: {
          required: "IP-адреса має бути обов'язковою",
        },

        expires_at: {
          required: "ExpiresAt має бути обов'язковим",
        },
      },
    },
    functions: {
      refreshAccessToken: {
        requiredFields: "Відсутні обов'язкові поля",
      },
      verifyRefreshToken: {
        invalidRefreshToken: "Недійсний токен оновлення",
        refreshTokenExpired: "Токен оновлення закінчився",
      },
      deleteRefreshTokenOnLogOut: {
        message: "Токен оновлення видалено",
      },
      deleteAllUserRefreshTokens: {
        message: "Всі токени оновлення видалено",
        noRefreshTokens: "Токени оновлення не знайдено",
      },
      deleteExpiredRefreshTokens: {
        message: "Закінчені токени оновлення видалено",
      },
      deleteSpecificUserRefreshTokens: {
        message: "Токен оновлення видалено",
      },
      revokeToken: {
        message: "Токен оновлення анульовано",
      },
      revokeAllUserTokens: {
        message: "Всі токени користувача анульовано",
      },
    },
  },
} as const;

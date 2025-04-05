export const dashboardTranslate = {
  metadata: {
    en: {
      title: 'Dashboard',
      description: 'Dashboard for the admin',
      keywords: 'admin, dashboard, admin dashboard',
    },
    uk: {
      title: 'Панель керування',
      description: 'Панель керування для адміністратора',
      keywords: 'адміністратор, панель керування, адміністраторська панель керування',
    },
  },
  layout: {
    metadata: {
      en: {
        title: 'Admin Dashboard',
        description: 'Admin dashboard for the admin',
        keywords: 'admin, admin dashboard, admin admin dashboard',
      },
      uk: {
        title: 'Панель керування адміністратора',
        description: 'Панель керування для адміністратора',
        keywords: 'адміністратор, панель керування, адміністраторська панель керування',
      },
    },
    sidebar: {
      en: {
        links: {
          text: {
            home: 'Home',
            products: 'Products',
            orders: 'Orders',
            reports: 'Reports',
            users: 'Users',
            settings: 'Settings',
            logout: 'Logout',
          },
        },
        mobile: {
          label: 'Navigation',
        },
        desktop: {
          label: 'Admin Dashboard',
        },
      },
      uk: {
        links: {
          text: {
            home: 'Головна',
            products: 'Продукти',
            orders: 'Замовлення',
            reports: 'Звіти',
            users: 'Користувачі',
            settings: 'Налаштування',
            logout: 'Вийти',
          },
        },
        mobile: {
          label: 'Навігація',
        },
        desktop: {
          label: 'Панель керування адміністратора',
        },
      },
    },
  },

  dashboard: {
    en: {
      'empty-data': 'No data available',
      'chartData': {
        labels: ['earnings', 'losses'],
        datasets: {
          label: 'Transactions',
        },
      },
      'title': 'Admin Dashboard',
      'statistic': {
        users: {
          title: 'Users',
          total: 'Total',
          growth: 'Growth',
        },
        orders: {
          title: 'Orders',
          total: 'Total Orders',
          earnings: 'Total Earnings',
        },
        products: {
          title: 'Products',
          total: 'Total',
          growth: 'Growth',
        },
        reports: {
          title: 'Reports',
          total: 'Total',
          growth: 'Growth',
        },
        refunds: {
          title: 'Refunds',
          total: 'Total Refunds',
          loss: 'Total Losses',
        },
      },
    },
    uk: {
      'empty-data': 'Дані відсутні',
      'chartData': {
        labels: ['заробіток', 'втрати'],
        datasets: {
          label: 'Транзакції',
        },
      },
      'title': 'Панель керування адміністратора',
      'statistic': {
        users: {
          title: 'Користувачі',
          total: 'Всього',
          growth: 'Зростання',
        },
        orders: {
          title: 'Замовлення',
          total: 'Всього замовлень',
          earnings: 'Загальний дохід',
        },
        products: {
          title: 'Продукти',
          total: 'Всього',
          growth: 'Зростання',
        },
        reports: {
          title: 'Звіти',
          total: 'Всього',
          growth: 'Зростання',
        },
        refunds: {
          title: 'Повернення',
          total: 'Всього повернень',
          loss: 'Загальні втрати',
        },
      },
    },
  },
} as const;

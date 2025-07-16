import { lang } from "@/app/lib/utilities/lang";

const privacyContent = {
  en: {
    title: "Privacy Policy",
    lastUpdated: "Last updated: July 16, 2025",
    content: {
      introduction: {
        title: "1. Introduction",
        text: "We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website and tell you about your privacy rights.",
      },
      dataCollection: {
        title: "2. Data We Collect",
        text: "We may collect, use, store and transfer different kinds of personal data about you including: Identity Data (name, username), Contact Data (email address, telephone numbers), Technical Data (internet protocol address, browser type), and Usage Data (information about how you use our website).",
      },
      dataUsage: {
        title: "3. How We Use Your Data",
        text: "We will only use your personal data when the law allows us to. Most commonly, we will use your personal data to: register you as a new customer, process and deliver your order, manage our relationship with you, and improve our website and services.",
      },
      dataSecurity: {
        title: "4. Data Security",
        text: "We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorised way, altered or disclosed.",
      },
      cookies: {
        title: "5. Cookies",
        text: "Our website uses cookies to distinguish you from other users of our website. This helps us to provide you with a good experience when you browse our website and also allows us to improve our site.",
      },
      thirdParties: {
        title: "6. Third Parties",
        text: "We may share your personal data with third parties including service providers who provide IT and system administration services, professional advisers including lawyers and accountants, and regulators and other authorities.",
      },
      yourRights: {
        title: "7. Your Rights",
        text: "Under certain circumstances, you have rights under data protection laws in relation to your personal data including the right to request access, correction, erasure, restriction, transfer, and to object to processing.",
      },
      contact: {
        title: "8. Contact Us",
        text: "If you have any questions about this privacy policy or our privacy practices, please contact us at privacy@yourshop.com",
      },
    },
  },
  uk: {
    title: "Політика конфіденційності",
    lastUpdated: "Останнє оновлення: 16 липня 2025",
    content: {
      introduction: {
        title: "1. Вступ",
        text: "Ми поважаємо вашу конфіденційність і зобов'язуємося захищати ваші персональні дані. Ця політика конфіденційності проінформує вас про те, як ми піклуємося про ваші персональні дані, коли ви відвідуєте наш веб-сайт, і розповість вам про ваші права на конфіденційність.",
      },
      dataCollection: {
        title: "2. Дані, які ми збираємо",
        text: "Ми можемо збирати, використовувати, зберігати та передавати різні види персональних даних про вас, включаючи: дані ідентифікації (ім'я, ім'я користувача), контактні дані (адреса електронної пошти, номери телефонів), технічні дані (адреса інтернет-протоколу, тип браузера) та дані використання (інформація про те, як ви використовуєте наш веб-сайт).",
      },
      dataUsage: {
        title: "3. Як ми використовуємо ваші дані",
        text: "Ми будемо використовувати ваші персональні дані лише тоді, коли закон дозволяє нам це робити. Найчастіше ми будемо використовувати ваші персональні дані для: реєстрації вас як нового клієнта, обробки та доставки вашого замовлення, управління нашими відносинами з вами та покращення нашого веб-сайту та послуг.",
      },
      dataSecurity: {
        title: "4. Безпека даних",
        text: "Ми запровадили відповідні заходи безпеки, щоб запобігти випадковій втраті, використанню або несанкціонованому доступу до ваших персональних даних, їх зміні або розкриттю.",
      },
      cookies: {
        title: "5. Файли cookie",
        text: "Наш веб-сайт використовує файли cookie, щоб відрізнити вас від інших користувачів нашого веб-сайту. Це допомагає нам надавати вам хороший досвід під час перегляду нашого веб-сайту, а також дозволяє нам покращувати наш сайт.",
      },
      thirdParties: {
        title: "6. Треті сторони",
        text: "Ми можемо ділитися вашими персональними даними з третіми сторонами, включаючи постачальників послуг, які надають ІТ-послуги та послуги системного адміністрування, професійних консультантів, включаючи юристів та бухгалтерів, а також регуляторів та інші органи влади.",
      },
      yourRights: {
        title: "7. Ваші права",
        text: "За певних обставин у вас є права згідно із законами про захист даних щодо ваших персональних даних, включаючи право запитувати доступ, виправлення, видалення, обмеження, передачу та заперечувати проти обробки.",
      },
      contact: {
        title: "8. Зв'яжіться з нами",
        text: "Якщо у вас є питання щодо цієї політики конфіденційності або наших практик конфіденційності, зв'яжіться з нами за адресою privacy@yourshop.com",
      },
    },
  },
};

export default function PrivacyPolicy() {
  const content = privacyContent[lang as keyof typeof privacyContent];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {content.title}
            </h1>
            <p className="text-sm text-gray-500">{content.lastUpdated}</p>
          </div>

          <div className="space-y-8">
            {Object.values(content.content).map((section, index) => (
              <div
                key={index}
                className="border-b border-gray-200 pb-6 last:border-b-0"
              >
                <h2 className="text-xl font-semibold text-gray-800 mb-3">
                  {section.title}
                </h2>
                <p className="text-gray-600 leading-relaxed">{section.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              This policy is effective as of the date stated above and will
              remain in effect except with respect to any changes in its
              provisions in the future.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

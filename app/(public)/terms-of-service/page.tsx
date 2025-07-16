import { lang } from "@/app/lib/utilities/lang";

const termsContent = {
  en: {
    title: "Terms of Service",
    lastUpdated: "Last updated: July 16, 2025",
    content: {
      acceptance: {
        title: "1. Acceptance of Terms",
        text: "By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.",
      },
      useOfService: {
        title: "2. Use of the Service",
        text: "You may use our service for lawful purposes only. You agree not to use the service in any way that violates any applicable federal, state, local, or international law or regulation.",
      },
      userAccounts: {
        title: "3. User Accounts",
        text: "When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account.",
      },
      privacy: {
        title: "4. Privacy Policy",
        text: "Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices.",
      },
      termination: {
        title: "5. Termination",
        text: "We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever.",
      },
      disclaimer: {
        title: "6. Disclaimer",
        text: "The information on this website is provided on an 'as is' basis. To the fullest extent permitted by law, this Company excludes all representations, warranties, conditions and terms.",
      },
      contact: {
        title: "7. Contact Information",
        text: "If you have any questions about these Terms of Service, please contact us at support@yourshop.com",
      },
    },
  },
  uk: {
    title: "Умови надання послуг",
    lastUpdated: "Останнє оновлення: 16 липня 2025",
    content: {
      acceptance: {
        title: "1. Прийняття умов",
        text: "Отримуючи доступ до цього веб-сайту та використовуючи його, ви приймаєте та погоджуєтеся бути пов'язаними умовами та положеннями цієї угоди.",
      },
      useOfService: {
        title: "2. Використання сервісу",
        text: "Ви можете використовувати наш сервіс лише для законних цілей. Ви погоджуєтеся не використовувати сервіс у спосіб, який порушує будь-які застосовні федеральні, державні, місцеві або міжнародні закони чи положення.",
      },
      userAccounts: {
        title: "3. Облікові записи користувачів",
        text: "Коли ви створюєте обліковий запис у нас, ви повинні надати інформацію, яка є точною, повною та актуальною в будь-який час. Ви відповідаєте за збереження паролю та за всі дії, які відбуваються під вашим обліковим записом.",
      },
      privacy: {
        title: "4. Політика конфіденційності",
        text: "Ваша конфіденційність важлива для нас. Будь ласка, ознайомтеся з нашою Політикою конфіденційності, яка також регулює ваше використання Сервісу, щоб зрозуміти наші практики.",
      },
      termination: {
        title: "5. Припинення",
        text: "Ми можемо припинити або призупинити ваш обліковий запис та заборонити доступ до Сервісу негайно, без попереднього повідомлення чи відповідальності, на наш власний розсуд, з будь-якої причини.",
      },
      disclaimer: {
        title: "6. Відмова від відповідальності",
        text: "Інформація на цьому веб-сайті надається на основі 'як є'. У повному обсязі, дозволеному законом, ця Компанія виключає всі заяви, гарантії, умови та терміни.",
      },
      contact: {
        title: "7. Контактна інформація",
        text: "Якщо у вас є питання щодо цих Умов надання послуг, зв'яжіться з нами за адресою support@yourshop.com",
      },
    },
  },
};

export default function TermsOfService() {
  const content = termsContent[lang as keyof typeof termsContent];

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
              By using our service, you acknowledge that you have read and
              understood these terms.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

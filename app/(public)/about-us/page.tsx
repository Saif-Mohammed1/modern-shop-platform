import { aboutUsTranslate } from "@/public/locales/client/(public)/aboutUsTranslate";
import { lang } from "@/app/lib/utilities/lang";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: aboutUsTranslate[lang].metadata.title,
  description: aboutUsTranslate[lang].metadata.description,
  keywords: aboutUsTranslate[lang].metadata.keywords,
};
const AboutPage = () => {
  return (
    <div className="p-4 md:p-8 lg:p-12 bg-gray-100 rounded-lg shadow-lg h-screen">
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center text-gray-800 mb-4">
        {aboutUsTranslate[lang].content.title}
      </h1>
      <p className="text-base md:text-lg lg:text-xl text-gray-700 mb-2">
        {aboutUsTranslate[lang].content.welcome}
      </p>
      <p className="text-base md:text-lg lg:text-xl text-gray-700 mb-2">
        {aboutUsTranslate[lang].content.mission}
      </p>
      <p className="text-base md:text-lg lg:text-xl text-gray-700">
        {aboutUsTranslate[lang].content.explore}
      </p>
    </div>
  );
};

export default AboutPage;

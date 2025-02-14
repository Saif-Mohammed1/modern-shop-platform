import { reviewsTranslate } from "@/public/locales/client/(public)/reviewsTranslate";
import { lang } from "../../app/lib/utilities/lang";
type CustomButtonProps = {
  showMore: boolean;
  getMoreResults: () => void;
  loading: boolean;
};
const CustomButton = ({
  showMore,
  getMoreResults,
  loading,
}: CustomButtonProps) => {
  return showMore ? (
    <div className="flex justify-center my-2">
      <button
        onClick={getMoreResults}
        className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-lg hover:bg-blue-700"
      >
        {loading
          ? reviewsTranslate[lang].ReviewSection.content.loading
          : reviewsTranslate[lang].ReviewSection.content.showMore}
      </button>
    </div>
  ) : null;
};

export default CustomButton;

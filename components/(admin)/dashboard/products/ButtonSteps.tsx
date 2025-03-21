import { productsTranslate } from "@/public/locales/client/(auth)/(admin)/dashboard/productTranslate";
import { lang } from "@/app/lib/utilities/lang";

type ButtonStepsProps = {
  prevStep: () => void;
  handleNext: () => void;
  parentStyle?: string;
};

const ButtonSteps = ({
  prevStep,
  handleNext,
  parentStyle,
}: ButtonStepsProps) => {
  return (
    <div className={`flex justify-between ${parentStyle}`}>
      <button
        onClick={prevStep}
        className="w-1/2 bg-gray-200 text-gray-700 py-2 rounded-lg mr-2 hover:bg-gray-300 transition duration-300"
      >
        {productsTranslate.products[lang].addProduct.form.button.previous}
      </button>
      <button
        onClick={handleNext}
        className="w-1/2 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300"
      >
        {productsTranslate.products[lang].addProduct.form.button.next}
      </button>
    </div>
  );
};

export default ButtonSteps;

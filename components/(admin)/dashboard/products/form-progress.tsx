// form-progress.tsx
import {lang} from '@/app/lib/utilities/lang';
import {productsTranslate} from '@/public/locales/client/(auth)/(admin)/dashboard/productTranslate';

export default function FormProgress({
  currentStep,
  totalSteps,
  title = productsTranslate.products[lang].addProduct.progress,
}: {
  currentStep: number;
  totalSteps: number;
  title?: string;
}) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="flex gap-2">
        {[...Array(totalSteps)].map((_, i) => (
          <div
            key={i}
            className={`h-2 flex-1 rounded-full ${i < currentStep ? 'bg-blue-500' : 'bg-gray-200'}`}
          />
        ))}
      </div>
    </div>
  );
}

// product-shipping.tsx
import {useFormContext} from 'react-hook-form';
import {FaRulerCombined, FaWeightHanging} from 'react-icons/fa';

import {lang} from '@/app/lib/utilities/lang';
import {productsTranslate} from '@/public/locales/client/(auth)/(admin)/dashboard/productTranslate';

export default function ProductShipping({editMode = false}: {editMode?: boolean}) {
  const {register} = useFormContext();

  return (
    <div className="space-y-6">
      {' '}
      {editMode ? <div className="bg-yellow-100 p-3 rounded-lg mb-4">
          {productsTranslate.products[lang].editMode}
        </div> : null}
      <div className="form-group">
        <label className="form-label">
          <FaWeightHanging className="form-icon" />
          {productsTranslate.products[lang].addProduct.form.productShipping.labels.weight}
        </label>
        <input
          type="number"
          {...register('shippingInfo.weight', {required: true})}
          className="form-input"
          placeholder={
            productsTranslate.products[lang].addProduct.form.productShipping.placeholders.weight
          }
        />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="form-group">
          <label className="form-label">
            <FaRulerCombined className="form-icon" />
            {productsTranslate.products[lang].addProduct.form.productShipping.labels.length}
          </label>
          <input
            type="number"
            {...register('shippingInfo.dimensions.length', {required: true})}
            className="form-input"
            placeholder={
              productsTranslate.products[lang].addProduct.form.productShipping.placeholders.length
            }
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            <FaRulerCombined className="form-icon" />
            {productsTranslate.products[lang].addProduct.form.productShipping.labels.width}
          </label>
          <input
            type="number"
            {...register('shippingInfo.dimensions.width', {required: true})}
            className="form-input"
            placeholder={
              productsTranslate.products[lang].addProduct.form.productShipping.placeholders.width
            }
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            <FaRulerCombined className="form-icon" />
            {productsTranslate.products[lang].addProduct.form.productShipping.labels.height}
          </label>
          <input
            type="number"
            {...register('shippingInfo.dimensions.height', {required: true})}
            className="form-input"
            placeholder={
              productsTranslate.products[lang].addProduct.form.productShipping.placeholders.height
            }
          />
        </div>
      </div>
    </div>
  );
}

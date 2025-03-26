"use client";

import type { Event } from "@/app/lib/types/products.types";
import { accountOrdersTranslate } from "@/public/locales/client/(auth)/account/ordersTranslate";
import { lang } from "@/app/lib/utilities/lang";
import { type ChangeEvent, type FormEvent, useState } from "react";

const OrderCancellation = () => {
  const [reason, setReason] = useState("");
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleReasonChange = (e: Event) => setReason(e.target.value);
  const handleFeedbackChange = (e: ChangeEvent<HTMLTextAreaElement>) =>
    setFeedback(e.target.value);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // Here you can add the logic for submitting the cancellation request to the server
  };

  if (submitted) {
    return (
      <div className="flex w-full mx-auto flex-col items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-green-500">
            {accountOrdersTranslate[lang].orderCancellation.submitted.title}
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            {accountOrdersTranslate[lang].orderCancellation.submitted.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-lg">
        <h1 className="text-2xl font-semibold text-gray-700 text-center mb-6">
          {accountOrdersTranslate[lang].orderCancellation.title}
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-600 mb-2" htmlFor="reason">
              {accountOrdersTranslate[lang].orderCancellation.form.label}
              <span className="text-red-500">*</span>
            </label>
            <select
              id="reason"
              value={reason}
              onChange={handleReasonChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="" disabled>
                {
                  accountOrdersTranslate[lang].orderCancellation.form.select
                    .placeholder
                }
              </option>
              <option value="found_cheaper">
                {
                  accountOrdersTranslate[lang].orderCancellation.form.select
                    .options.found_cheaper
                }
              </option>
              <option value="changed_mind">
                {
                  accountOrdersTranslate[lang].orderCancellation.form.select
                    .options.changed_mind
                }
              </option>
              <option value="late_delivery">
                {
                  accountOrdersTranslate[lang].orderCancellation.form.select
                    .options.late_delivery
                }
              </option>
              <option value="other">
                {
                  accountOrdersTranslate[lang].orderCancellation.form.select
                    .options.other
                }
              </option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-gray-600 mb-2" htmlFor="feedback">
              {
                accountOrdersTranslate[lang].orderCancellation.form.feedback
                  .label
              }
            </label>
            <textarea
              id="feedback"
              value={feedback}
              onChange={handleFeedbackChange}
              placeholder={
                accountOrdersTranslate[lang].orderCancellation.form.feedback
                  .placeholder
              }
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full py-3 text-white bg-red-500 rounded-md hover:bg-red-600 transition duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-red-300"
          >
            {accountOrdersTranslate[lang].orderCancellation.button}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OrderCancellation;

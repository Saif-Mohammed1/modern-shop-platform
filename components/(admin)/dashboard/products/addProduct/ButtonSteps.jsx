const ButtonSteps = ({ prevStep, handleNext, parentStyle }) => {
  return (
    <div className={`flex justify-between ${parentStyle}`}>
      <button
        onClick={prevStep}
        className="w-1/2 bg-gray-200 text-gray-700 py-2 rounded-lg mr-2 hover:bg-gray-300 transition duration-300"
      >
        Previous
      </button>
      <button
        onClick={handleNext}
        className="w-1/2 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300"
      >
        Next
      </button>
    </div>
  );
};

export default ButtonSteps;

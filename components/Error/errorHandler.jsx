const ErrorHandler = ({ message, reset = null }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen mx-auto">
      <div className="bg-red-500 p-8 rounded-lg shadow-lg text-white">
        <h2 className="text-2xl font-bold mb-4">Oops! Something went wrong.</h2>
        <p className="text-lg mb-4">
          {message
            ? message
            : "An unexpected error occurred. Please try again later.Or contact support."}
        </p>
        {reset && (
          <button
            onClick={() => reset()}
            className="bg-white text-red-500 py-2 px-4 rounded-lg hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorHandler;

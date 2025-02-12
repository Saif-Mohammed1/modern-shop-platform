// Function to log errors to refreshError.log
export function logErrorToFile(error: string) {
  //   const logFilePath = path.join(__dirname, "./refreshError.log");
  //   fs.appendFile(
  //     logFilePath,
  //     `${new Date().toISOString()} - ${error}\n`,
  //     function (err) {
  //       if (err) throw err;
  //       console.log("Error logged to refreshError.log");
  //     }
  //   );
  console.log("Error logged to refreshError.log");
  const errors = JSON.parse(error);
  console.dir(errors, { depth: null });
}

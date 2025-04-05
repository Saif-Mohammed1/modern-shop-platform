// const BadExamples = () => {
//   const logIt = async () => {
//     console.log("Logging...");
//   };

//   return (
//     <>
//       {/* ❌ Error: Direct function reference
//       <button onClick={logIt}>Bad</button>
//       {"/* ❌ */}"}
//       {/* ❌ Error: Void operator in attribute */}
//       <button onClick={void logIt}>Bad</button>
//       {/* ❌ Error: Uninvoked function in arrow */}
//       <button onClick={() => logIt}>Bad</button>
//       {/* ❌ ESLint will warn if configured */}
//       <button onClick={() => logIt}>Also Bad</button> {/* ❌ */}
//       <button onClick={() => void logIt()}>Good</button> {/* ✅ */}
//       <button onClick={logIt}>Also Good</button> {/* ✅ */}
//       {/* ✅ Correct: Properly wrapped void */}
//       <button onClick={() => void logIt().then((res) => res)}>Good</button>
//       {/* ✅ Correct: Proper handler */}
//       <button onClick={() => logIt()}>Good</button>
//       <p>
//         <div>Invalid</div>
//       </p> */}
//     </>
//   );
// };
// export default BadExamples;

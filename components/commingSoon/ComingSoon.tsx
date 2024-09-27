import { comingSoonTranslate } from "@/app/_translate/comingSoonTranslate";
import "./ComingSoon.css";
import { lang } from "@/components/util/lang";

const ComingSoon = () => {
  return (
    <div className="coming-soon-container m-auto p-2">
      <div className="coming-soon-content">
        <h1 className="coming-soon-title">{comingSoonTranslate[lang].title}</h1>
        <p className="coming-soon-description">
          {comingSoonTranslate[lang].description}
        </p>
        <div className="coming-soon-animation">
          {/* Add any animation or image here */}
        </div>
      </div>
    </div>
  );
};

// const ComingSoon = () => {
//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
//       {/* Animated Icon */}
//       <div className="animate-bounce mb-4">
//         <svg
//           xmlns="http://www.w3.org/2000/svg"
//           className="h-16 w-16 text-white"
//           fill="none"
//           viewBox="0 0 24 24"
//           stroke="currentColor"
//         >
//           <path
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             strokeWidth={2}
//             d="M13 10V3L4 14h7v7l9-11h-7z"
//           />
//         </svg>
//       </div>

//       {/* Animated Text */}
//       <h1 className="text-5xl text-white font-bold animate-pulse">
//         Coming Soon!
//       </h1>

//       {/* Subtitle */}
//       <p className="text-xl text-white mt-4">
//         We are working hard to bring this feature to you. Stay tuned!
//       </p>

//       {/* Animation Below */}
//       <div className="mt-10 flex justify-center items-center">
//         <div className="relative w-48 h-48">
//           <div className="absolute border-4 border-t-4 border-purple-300 rounded-full w-full h-full animate-spin"></div>
//           <div className="absolute border-4 border-t-4 border-pink-300 rounded-full w-3/4 h-3/4 left-1/8 top-1/8 animate-spin"></div>
//           <div className="absolute border-4 border-t-4 border-blue-300 rounded-full w-1/2 h-1/2 left-1/4 top-1/4 animate-spin"></div>
//         </div>
//       </div>
//     </div>
//   );
// };

export default ComingSoon;

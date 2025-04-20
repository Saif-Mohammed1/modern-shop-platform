// import {
//   FaFacebook,
//   FaTwitter,
//   FaInstagram,
//   FaGithub,
//   FaPhone,
//   FaEnvelope,
//   FaMapMarkerAlt,
// } from "react-icons/fa";
// import Link from "next/link";
// import { AiOutlineInfoCircle } from "react-icons/ai";
// import { RiContactsLine } from "react-icons/ri";
// const Footer = () => {
//   return (
//     <footer className="bg-gray-800 text-white py-5 px-3 mt-4 -mx-4 !-mb-4">
//       <div className="flex flex-col md:flex-row justify-between items-center">
//         <div className="text-center md:text-left space-y-1">
//           <h3 className="text-lg font-bold mb-2">Завзятий Господар </h3>
//           <p className="text-sm flex items-center p-1">
//             <FaMapMarkerAlt className="mr-2" /> 123 Street, Cairo, Egypt
//           </p>
//           <p className="text-sm flex items-center  p-1">
//             <FaPhone className="mr-2" /> +1234567890
//           </p>
//           <p className="text-sm flex items-center p-1">
//             <FaEnvelope className="mr-2" /> info@example.com
//           </p>
//         </div>
//         <div className="flex justify-center md:justify-start mt-4 md:mt-0">
//           <Link target="_blank" href="/about-us">
//             <span className="text-gray-300 hover:text-white  flex justify-center items-center">
//               <AiOutlineInfoCircle className="mx-1" /> About Us
//             </span>
//           </Link>
//           <Link target="_blank" href="/contact-us">
//             <span className="text-gray-300 hover:text-white flex justify-center items-center">
//               {" "}
//               <RiContactsLine className="mx-1" /> Contact Us
//             </span>
//           </Link>{" "}
//         </div>
//         <div className="mt-4 md:mt-0">
//           <p className="text-center md:text-right">Follow Us</p>
//           <div className="flex justify-center md:justify-end mt-2">
//             <Link target="_blank" href="#">
//               <span className="text-gray-300 hover:text-white mr-4">
//                 <FaFacebook />
//               </span>
//             </Link>
//             <Link target="_blank" href="#">
//               <span className="text-gray-300 hover:text-white mr-4">
//                 <FaTwitter />
//               </span>
//             </Link>
//             <Link target="_blank" href="#">
//               <span className="text-gray-300 hover:text-white mr-4">
//                 <FaInstagram />
//               </span>
//             </Link>
//             <Link target="_blank" href="https://github.com/Saif-Mohammed1">
//               <span className="text-gray-300 hover:text-white">
//                 <FaGithub />
//               </span>
//             </Link>
//           </div>
//           <p className="mt-4 text-sm text-center">
//             Created by Saif -{" "}
//             <span className="italic">Full Stack Web Developer</span>
//           </p>
//           <p className="mt-2 text-sm text-center">
//             &copy; {new Date().getFullYear()} Завзятий Господар. All Rights
//             Reserved.
//           </p>
//         </div>
//       </div>
//     </footer>
//   );
// };
// export default Footer;
import Link from "next/link";
import { AiOutlineInfoCircle } from "react-icons/ai";
import {
  FaEnvelope,
  FaFacebook,
  FaGithub,
  FaInstagram,
  FaMapMarkerAlt,
  FaPhone,
  FaTwitter,
} from "react-icons/fa";
import { RiContactsLine } from "react-icons/ri";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const socialLinks = [
    { icon: <FaFacebook />, href: "#", label: "Facebook" },
    { icon: <FaTwitter />, href: "#", label: "Twitter" },
    { icon: <FaInstagram />, href: "#", label: "Instagram" },
    {
      icon: <FaGithub />,
      href: "https://github.com/Saif-Mohammed1",
      label: "GitHub",
    },
  ];

  const contactInfo = [
    { icon: <FaMapMarkerAlt />, text: "123 Street, Cairo, Egypt" },
    { icon: <FaPhone />, text: "+1234567890" },
    { icon: <FaEnvelope />, text: "info@example.com" },
  ];

  const navigationLinks = [
    {
      icon: <AiOutlineInfoCircle />,
      href: "/about-us",
      text: "About Us",
      label: "Learn more about our company",
    },
    {
      icon: <RiContactsLine />,
      href: "/contact-us",
      text: "Contact Us",
      label: "Get in touch with us",
    },
  ];

  return (
    <footer className="bg-gradient-to-t from-black to-gray-800 text-gray-300 border-t border-gray-700 -mx-4 !-mb-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white tracking-wide">
              Завзятий Господар
            </h3>
            <div className="space-y-2">
              {contactInfo.map((item, index) => (
                <p
                  key={index}
                  className="flex items-center text-sm hover:text-white transition-colors"
                >
                  <span className="mr-3 text-gray-400">{item.icon}</span>
                  {item.text}
                </p>
              ))}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col items-center md:items-start">
            <div className="space-y-3">
              {navigationLinks.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  target="_blank"
                  className="group flex items-center hover:text-white transition-colors"
                  aria-label={link.label}
                >
                  <span className="mr-2 text-gray-400 group-hover:text-white transition-colors">
                    {link.icon}
                  </span>
                  {link.text}
                </Link>
              ))}
            </div>
          </div>

          {/* Social & Copyright */}
          <div className="space-y-6">
            <div className="text-center md:text-right">
              <h4 className="text-sm font-semibold text-white mb-4">
                Follow Us
              </h4>
              <div className="flex justify-center md:justify-end space-x-6">
                {socialLinks.map((social, index) => (
                  <Link
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-2xl hover:text-white hover:scale-110 transition-all duration-300"
                    aria-label={social.label}
                  >
                    {social.icon}
                  </Link>
                ))}
              </div>
            </div>

            <div className="text-center md:text-right space-y-2">
              <p className="text-xs">
                Created by Saif -{" "}
                <span className="italic text-gray-400">
                  Full Stack Web Developer
                </span>
              </p>
              <p className="text-xs text-gray-500">
                &copy; {currentYear} Завзятий Господар. All Rights Reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

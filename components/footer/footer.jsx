import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaGithub,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
} from "react-icons/fa";
import Link from "next/link";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { RiContactsLine } from "react-icons/ri";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-5 px-3 mt-4 -mx-4 !-mb-4">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="text-center md:text-left space-y-1">
          <h3 className="text-lg font-bold mb-2">завзятий господар </h3>
          <p className="text-sm flex items-center p-1">
            <FaMapMarkerAlt className="mr-2" /> 123 Street, Cairo, Egypt
          </p>
          <p className="text-sm flex items-center  p-1">
            <FaPhone className="mr-2" /> +1234567890
          </p>
          <p className="text-sm flex items-center p-1">
            <FaEnvelope className="mr-2" /> info@example.com
          </p>
        </div>
        <div className="flex justify-center md:justify-start mt-4 md:mt-0">
          <Link target="_blank" href="/about-us">
            <span className="text-gray-300 hover:text-white  flex justify-center items-center">
              <AiOutlineInfoCircle className="mx-1" /> About Us
            </span>
          </Link>
          <Link target="_blank" href="/contact-us">
            <span className="text-gray-300 hover:text-white flex justify-center items-center">
              {" "}
              <RiContactsLine className="mx-1" /> Contact Us
            </span>
          </Link>{" "}
        </div>
        <div className="mt-4 md:mt-0">
          <p className="text-center md:text-right">Follow Us</p>
          <div className="flex justify-center md:justify-end mt-2">
            <Link target="_blank" href="#">
              <span className="text-gray-300 hover:text-white mr-4">
                <FaFacebook />
              </span>
            </Link>
            <Link target="_blank" href="#">
              <span className="text-gray-300 hover:text-white mr-4">
                <FaTwitter />
              </span>
            </Link>
            <Link target="_blank" href="#">
              <span className="text-gray-300 hover:text-white mr-4">
                <FaInstagram />
              </span>
            </Link>
            <Link target="_blank" href="https://github.com/Saif-Mohammed1">
              <span className="text-gray-300 hover:text-white">
                <FaGithub />
              </span>
            </Link>
          </div>
          <p className="mt-4 text-sm text-center">
            Created by Saif -{" "}
            <span className="italic">Full Stack Web Developer</span>
          </p>
          <p className="mt-2 text-sm text-center">
            &copy; {new Date().getFullYear()} завзятий господар. All Rights
            Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

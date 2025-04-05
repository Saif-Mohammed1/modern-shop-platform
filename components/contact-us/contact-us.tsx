import {HiOutlineLocationMarker, HiOutlineMail, HiOutlinePhone} from 'react-icons/hi';

const ContactUs = () => {
  return (
    <section className="bg-gray-100 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">Contact Us</h1>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center">
              <HiOutlineLocationMarker className="text-blue-500 text-3xl mr-4" />
              <div>
                <h2 className="text-xl font-semibold text-gray-700">Our Office</h2>
                <p className="text-gray-600">123 Business Avenue, Suite 456, City, Country</p>
              </div>
            </div>

            <div className="flex items-center">
              <HiOutlinePhone className="text-blue-500 text-3xl mr-4" />
              <div>
                <h2 className="text-xl font-semibold text-gray-700">Phone</h2>
                <p className="text-gray-600">+123 456 7890</p>
              </div>
            </div>

            <div className="flex items-center">
              <HiOutlineMail className="text-blue-500 text-3xl mr-4" />
              <div>
                <h2 className="text-xl font-semibold text-gray-700">Email</h2>
                <p className="text-gray-600">info@yourcompany.com</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Send Us a Message</h2>
            <form>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2" htmlFor="name">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your Name"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2" htmlFor="email">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your Email"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2" htmlFor="message">
                  Message
                </label>
                <textarea
                  id="message"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={5}
                  placeholder="Your Message"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition duration-200"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>

        {/* Additional Information */}
        <div className="text-center mt-12 text-gray-600">
          <p>
            We’re here to help and answer any question you might have. We look forward to hearing
            from you 🙂
          </p>
        </div>
      </div>
    </section>
  );
};

export default ContactUs;

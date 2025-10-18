// app/contact/page.jsx
export default function ContactPage() {
    return (
      <div className="flex flex-col items-center  px-4 md:px-8 lg:px-16 bg-white min-h-screen">\
        {/* Logo and Header */}
        <div className="w-full max-w-4xl flex flex-col items-center">
          {/* Logo Section */}
          <div className="flex items-center">
            <img
              src="/LOGO1.png" 
              alt="SLPEACEBOT Logo"
            />
          </div>
  
          {/* Contact Header */}
          <h2 className="text-3xl font-bold text-[#2b3990] mb-2">Contact Us!</h2>
          <p className="text-red-500 mb-6">Suggestions, Comments, Questions?</p>
  
          {/* Contact Form */}
          <form className="w-full max-w-lg">
            {/* Name */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                NAME*
              </label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                type="text"
                id="name"
                required
              />
            </div>
  
            {/* Email */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                EMAIL*
              </label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                type="email"
                id="email"
                required
              />
            </div>
  
            {/* Comment */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="comment">
                COMMENT*
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                id="comment"
                rows="4"
                required
              ></textarea>
            </div>
  
            {/* Phone */}
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phone">
                PHONE
              </label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                type="tel"
                id="phone"
              />
            </div>
  
            {/* Submit Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-800 text-white rounded-md font-bold shadow-lg hover:bg-blue-700"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
  
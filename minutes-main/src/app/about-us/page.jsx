// app/about=us/page.jsx
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
export default function AboutPage() {
    return (
      <div className="flex bg-white flex-col w-screen min-h-screen justify-between">
      <Navbar />
      <div className="flex flex-col items-center  px-4 md:px-8 lg:px-16 bg-white">
          {/* Logo Section */}

  
          {/* Contact Header */}
          <h1 className="text-5xl font-bold text-[#2b3990] mb-2">About Us!</h1>
        
          {/* Contact Form */}
          <div className="w-full max-w-3xl">
            <p className="text-[#2b3990] my-5 font-semibold" >At Melospeech Inc., we&apos;re passionate about making a difference in the lives of young children.  Led by a team of educators and speech-language pathology professionals, we understand the challenges faced by providers. The pressure to finish as much as possible in a limited amount of time can be overwhelming—especially when we want to give our all to those we serve. Many of us even put in long hours off the clock to ensure the best quality of care which includes doing our notes on our own time.</p>
           <p className="text-[#2b3990] my-5 font-semibold">That&apos;s why we created innovative tools like The SLPeaceBot in-house—to make what we do faster, more accurate, and easier. Now, we&apos;re sharing these tools with you, built with love. Our goal is simple: to help you provide the best support possible while saving time and resources. With a focus on compassion and efficiency, we aim to empower providers to make meaningful impacts every day—without it taking all day.</p>
        </div>
        </div>
    <Footer/>
      </div>
    );
  }
  
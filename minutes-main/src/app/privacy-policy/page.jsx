// app/privacy-policy/page.jsx
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

export default function PrivacyPolicyPage() {
  return (
    <div className="flex bg-white flex-col min-h-screen justify-between">
      <Navbar />
      <div className="flex flex-col items-center px-4 md:px-8 lg:px-16 bg-white">
        <h1 className="text-5xl font-bold text-[#2b3990] mb-8">&quot;Privacy Policy&quot;</h1>
        <div className="w-full max-w-3xl text-[#2b3990]">
          <p className="mb-4">Effective Date: October 4, 2024</p>
          <p className="mb-4">This Privacy Policy explains how Melospeech Inc. (&quot;Company,&quot; &quot;we,&quot; or &quot;us&quot;) collects, uses, discloses, and protects information obtained from users (&quot;you&quot; or &quot;User&quot;) in connection with the SLPEACEBOT™ software and related services (collectively, the &quot;Service&quot;).</p>
          <p className="mb-4">By accessing or using the Service, you agree to the collection and use of your information in accordance with this Privacy Policy.</p>
          
          <h2 className="text-2xl font-bold mt-6 mb-4">1. Information We Collect</h2>
          <p className="mb-4">When you use SLPEACEBOT™, we may collect the following information:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Login Information: We collect your username, email address, and password to create and maintain your account.</li>
            <li>Payment Information: We collect payment details necessary to process your subscription and manage billing.</li>
            <li>De-Identified PHI: We process Protected Health Information (PHI) in connection with the Service. All PHI is de-identified prior to processing.</li>
            <li>Non-Personal Data: We may collect non-personal information, such as usage data, to improve the Service and monitor its performance.</li>
          </ul>

          <h2 className="text-2xl font-bold mt-6 mb-4">2. What We Do NOT Collect</h2>
          <p className="mb-4">We do not store or process any identifiable Protected Health Information (PHI). All PHI processed through SLPEACEBOT™ is de-identified prior to transmission and processing unless the User opts not to de-identify it.</p>

          <h2 className="text-2xl font-bold mt-6 mb-4">3.  How We Use Your Information</h2>
          <p className="mb-4">We use the information we collect to: </p>
          <ul className="list-disc pl-6 mb-4">
            <li>  Provide the Service:  Manage your account, process  your subscription, and ensure the 
            proper functioning of the Service.</li>
            <li> Process De-Identified PHI:  Process de-identified  PHI to assist you in tracking service 
            outcomes and improving therapy business operations in compliance with HIPAA regulations. </li>
            <li>  Improve the Service:  Analyze how the Service  is used, troubleshoot issues, and develop 
            new features.</li>
            <li>  Communicate with You:  Send you important information  related to your account, including 
            billing updates, service changes, or customer support inquiries. </li>
          </ul>

          <h2 className="text-2xl font-bold mt-6 mb-4">4.  How We Share Your Information</h2>
          <p className="mb-4">We do not sell or rent your information. However, we may share your information with third 
          parties in the following circumstances:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>   Service Providers:  We may share your information  with third-party service providers who 
perform functions necessary to provide the Service, such as payment processing and cloud 
storage. </li>
            <li>   Legal Requirements:  We may disclose your information  if required by law, regulation, or 
legal process, or if we believe such disclosure is necessary to protect the rights, property, or 
safety of Melospeech, our users, or others.</li>
          </ul>
          {/* Add more sections here, following the same pattern */}

          
<h2 className="text-2xl font-bold mt-6 mb-4">5. Data Security</h2>
          <p className="mb-4">We take reasonable measures to protect the information you provide from unauthorized access, 
use, or disclosure. This includes using encryption, secure storage systems, and other 
industry-standard security protocols. However, no method of transmission over the Internet or 
electronic storage is 100% secure, and we cannot guarantee absolute security. </p>
          
          <h2 className="text-2xl font-bold mt-6 mb-4">6. Data Retention</h2>
          <p className="mb-4">We retain your login and payment information for as long as your account is active or as 
necessary to provide you with the Service. We may also retain and use your information as 
necessary to comply with legal obligations, resolve disputes, or enforce our agreements. 
</p>

<h2 className="text-2xl font-bold mt-6 mb-4">7. Your Rights</h2>
          <p className="mb-4">You may update, correct, or delete your account information at any time by logging into your 
account or contacting us at help@slpeace.com. If you wish to cancel your account, we will 
delete your information, except as required to retain for legal purposes. </p>

<h2 className="text-2xl font-bold mt-6 mb-4">8. Third-Party Links</h2>
          <p className="mb-4">Our Service may contain links to third-party websites or services that are not operated or 
controlled by Melospeech. We are not responsible for the privacy practices of these third 
parties. We encourage you to review the privacy policies of any third-party websites or services 
you use. </p>

<h2 className="text-2xl font-bold mt-6 mb-4">9. Children&apos;s Privacy</h2>
          <p className="mb-4">The Service is not directed to individuals under the age of 18. We do not knowingly collect 
personal information from anyone under 18. If you are a parent or guardian and believe that 
your child has provided us with personal information, please contact us so we can delete it. </p>

<h2 className="text-2xl font-bold mt-6 mb-4">19. Changes to This Privacy Policy</h2>
          <p className="mb-4">We may update this Privacy Policy from time to time to reflect changes in our practices or for 
other operational, legal, or regulatory reasons. Any changes will be effective immediately upon 
posting. Your continued use of the Service after the posting of an updated Privacy Policy 
constitutes your acceptance of the changes.</p>

          <h2 className="text-2xl font-bold mt-6 mb-4">11. Contact Us</h2>
          <p className="mb-4">If you have any questions or concerns about this Privacy Policy, please contact us at:</p>
          <p>Melospeech Inc.<br />
          41593 Winchester Rd., Ste 200, Temecula, CA 92590<br />
          help@melospeech.com<br />
          951-234-7550</p>

          
          <p className="mt-8 mb-4">By using the SLPEACEBOT™ Software, You acknowledge that You have read and agree to these terms.</p>

          <div className="mt-8">
            <p>User</p>
            <p>By: __________________________</p>
            <p>Name: ________________________</p>
            <p>Title: _________________________</p>
            <p>Date: _________________________</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
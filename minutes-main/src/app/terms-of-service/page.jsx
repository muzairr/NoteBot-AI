// app/terms-of-use/page.jsx
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

export default function TermsOfUsePage() {
  return (
    <div className="flex bg-white flex-col min-h-screen justify-between">
      <Navbar />
      <div className="flex flex-col items-center px-4 md:px-8 lg:px-16 bg-white">
        <h1 className="text-5xl font-bold text-[#2b3990] mb-8">Terms of Use Agreement</h1>
        <div className="w-full max-w-3xl text-[#2b3990]">
          <p className="mb-4">Effective Date: October 4, 2024</p>
          <p className="mb-4">This Terms of Use Agreement (the &quot;Agreement&quot;) is entered into by and between Melospeech Inc., a California corporation with a principal address at 41593 Winchester Rd., Ste 200, Temecula, CA 92590 (hereinafter &quot;Melospeech&quot; or &quot;Company&quot;), and any individual or entity accessing or using SLPEACEBOT™ software (hereinafter &quot;User&quot; or &quot;You&quot;).</p>
          <p className="mb-4">By accessing or using SLPEACEBOT™ (&quot;Software&quot;), You agree to be bound by the terms and conditions of this Agreement. If You do not agree, You must not use the Software.</p>
          
          <h2 className="text-2xl font-bold mt-6 mb-4">1. Description of the Software</h2>
          <p className="mb-4">SLPEACEBOT™ is a proprietary software developed by Melospeech designed to assist therapists in tracking service outcomes and optimizing speech therapy business operations.</p>

          <h2 className="text-2xl font-bold mt-6 mb-4">2. Acceptance of Terms</h2>
          <p className="mb-4">By using the SLPEACEBOT™ Software, You acknowledge that You have read, understood, and agree to be bound by this Agreement. Melospeech reserves the right to amend or update this Agreement at any time, and such updates will be effective immediately upon posting. Continued use of the Software constitutes Your acceptance of any amended terms.</p>

          <h2 className="text-2xl font-bold mt-6 mb-4">3. Permitted Use</h2>
          <p className="mb-4">SLPEACEBOT™ is licensed, not sold. Subject to the terms of this Agreement, Melospeech grants You a limited, non-exclusive, non-transferable, revocable license to access and use the Software for lawful purposes and in accordance with this Agreement.</p>

          <h2 className="text-2xl font-bold mt-6 mb-4">4. User Responsibilities</h2>
          <h3 className="text-xl font-semibold mt-4 mb-2">4.1. Compliance with Laws</h3>
          <p className="mb-4">You agree to comply with all applicable local, state, national, and international laws and regulations, including HIPAA, in connection with Your use of the Software.</p>
          
          <h3 className="text-xl font-semibold mt-4 mb-2">4.2. PHI and Data Usage</h3>
          <p className="mb-4">You are responsible for ensuring that any protected health information (PHI) You handle while using the Software is managed in compliance with HIPAA and that appropriate permissions are obtained from patients where required. Melospeech does not store PHI; all data is de-identified or encrypted unless You choose otherwise under Your account settings.</p>
          
          <h3 className="text-xl font-semibold mt-4 mb-2">4.3. Account Security</h3>
          <p className="mb-4">You are responsible for maintaining the confidentiality of Your login credentials and for all activities that occur under Your account.</p>
          
          <h3 className="text-xl font-semibold mt-4 mb-2">4.4. Prohibited Use</h3>
          <p className="mb-4">You agree not to misuse the Software or attempt to:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Reverse engineer, decompile, or disassemble the Software.</li>
            <li>Interfere with or disrupt the integrity or performance of the Software.</li>
            <li>Use the Software in a manner that violates any applicable laws or regulations.</li>
          </ul>

          <h2 className="text-2xl font-bold mt-6 mb-4">5. Intellectual Property Rights</h2>
          <p className="mb-4">All intellectual property rights in the Software, including but not limited to trademarks, copyrights, and trade secrets, are owned by Melospeech. You are not granted any ownership rights in the Software.</p>

          <h2 className="text-2xl font-bold mt-6 mb-4">6. Termination of Access</h2>
          <p className="mb-4">Melospeech may terminate or suspend Your access to the Software, with or without cause, at any time without prior notice. If terminated, Your right to use the Software will cease immediately. Upon termination, You must destroy any copies of the Software in Your possession and discontinue any further use.</p>

          <h2 className="text-2xl font-bold mt-6 mb-4">7. Disclaimer of Warranties</h2>
          <p className="mb-4">The Software is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. To the fullest extent permitted by law, Melospeech disclaims all warranties, whether express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, and non-infringement. Melospeech makes no representation that the Software will meet Your requirements, be error-free, or operate without interruption.</p>

          <h2 className="text-2xl font-bold mt-6 mb-4">8. Refund Policy</h2>

          <h3 className="text-xl font-semibold mt-4 mb-2">8.1 Subscription Cancellations</h3>
          <p className="mb-4">To cancel your subscription, please select the ‘One-Click Cancel’ option. Upon cancellation, you will retain access to the Software until the conclusion of your current billing cycle. No further charges will be applied after the end of the current billing period. However, please note that no refunds or credits will be issued for any unused portion of the subscription period.</p>

          <h3 className="text-xl font-semibold mt-4 mb-2">8.2 General Refunds</h3>
          <p className="mb-4">All payments made for subscriptions, licenses, or services provided by Melospeech are non-refundable. This includes situations where You terminate Your account before the end of the billing cycle.</p>

          <h3 className="text-xl font-semibold mt-4 mb-2">8.3 Exceptions</h3>
          <p className="mb-4">In the event that Melospeech terminates Your access to the Software without cause, a prorated refund for the unused portion of the billing period may be issued at Melospeechs sole discretion.</p>

          <h3 className="text-xl font-semibold mt-4 mb-2">8.4 Refund Process</h3>
          <p className="mb-4">If an exception is granted, refunds will be processed to the original payment method used for the purchase. Please allow up to 10 business days for the refund to appear on Your bank statement, depending on Your banks processing times.</p>

          <h2 className="text-2xl font-bold mt-6 mb-4">9. Limitation of Liability</h2>
          <p className="mb-4">To the fullest extent permitted by law, Melospeech shall not be liable for any indirect, incidental, consequential, or punitive damages arising out of or relating to Your use of the Software, including but not limited to loss of profits, business interruption, or loss of data. In no event shall Melospeech&apos;s total liability exceed the amount paid by You, if any, for access to the Software during the 12 months preceding the event giving rise to the claim.</p>


          <h2 className="text-2xl font-bold mt-6 mb-4">10. Indemnification</h2>
          <p className="mb-4">You agree to indemnify, defend, and hold harmless Melospeech and its officers, directors, employees, and agents from and against any and all claims, liabilities, damages, losses, costs, and expenses, including reasonable attorneys&apos; fees, arising out of or related to Your use of the Software, Your violation of this Agreement, or Your violation of any third-party rights, including without limitation any intellectual property rights or privacy rights.</p>

          <h2 className="text-2xl font-bold mt-6 mb-4">11. Governing Law and Dispute Resolution</h2>
          <p className="mb-4">This Agreement shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflicts of law principles. Any disputes arising under this Agreement shall be resolved through binding arbitration conducted in California, in accordance with the rules of the American Arbitration Association.</p>

          <h2 className="text-2xl font-bold mt-6 mb-4">12. Entire Agreement</h2>
          <p className="mb-4">This Agreement constitutes the entire agreement between You and Melospeech regarding Your use of the Software and supersedes all prior and contemporaneous agreements, understandings, or communications. Any amendments or modifications must be in writing and signed by both parties.</p>

          <h2 className="text-2xl font-bold mt-6 mb-4">13. Contact Information</h2>
          <p className="mb-4">If You have any questions about this Agreement or the Software, please contact us at:</p>
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
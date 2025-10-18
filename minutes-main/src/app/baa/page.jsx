import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

const BAA = () => {
  return (
    <div className="flex bg-white flex-col min-h-screen justify-between">
      <Navbar />
      <div className="flex flex-col items-center px-4 md:px-8 lg:px-16 bg-white">
        <h1 className="text-5xl font-bold text-[#2b3990] mb-8">Business Associate Agreement</h1>
        <div className="w-full max-w-3xl text-[#2b3990]">
          <p className="mb-4">This Business Associate Agreement (&quot;Agreement&quot;) is entered into as of the date of acceptance by the User (&quot;Effective Date&quot;), by and between Melospeech Inc., a California corporation, with a principal address at 41593 Winchester Rd., Ste 200, Temecula, CA 92590 (&quot;Business Associate&quot;), and the individual or entity using the SLPEACEBOT™ software (&quot;User&quot; or &quot;Covered Entity&quot;).</p>

          <h2 className="text-2xl font-bold mt-6 mb-4">RECITALS</h2>
          <p className="mb-4">Whereas, User may disclose certain information to Business Associate pursuant to the terms of this Agreement, some of which may constitute Protected Health Information (&quot;PHI&quot;) as defined by the Health Insurance Portability and Accountability Act of 1996 (&quot;HIPAA&quot;), and the regulations promulgated thereunder;</p>
          <p className="mb-4">Whereas, User and Business Associate intend to protect the privacy and provide for the security of PHI disclosed to Business Associate pursuant to this Agreement in compliance with HIPAA and the Health Information Technology for Economic and Clinical Health Act (&quot;HITECH&quot;);</p>
          <p className="mb-4">Whereas, the Business Associate provides services using SLPEACEBOT™ software, which is subject to the terms of this Agreement;</p>

          <h2 className="text-2xl font-bold mt-6 mb-4">1. Definitions</h2>
          <p className="mb-2">1.1. &quot;De-Identified Information&quot; means information that does not identify an individual and there is no reasonable basis to believe that the information can be used to identify an individual.</p>
          <p className="mb-4">1.2. &quot;Protected Health Information&quot; or &quot;PHI&quot; means individually identifiable health information transmitted or maintained in any form or medium that Business Associate creates, receives, maintains, or transmits on behalf of User.</p>

          <h2 className="text-2xl font-bold mt-6 mb-4">2. Obligations and Activities of Business Associate</h2>
          <p className="mb-2">2.1. Permitted Use and Disclosure of PHI: Business Associate agrees to not use or disclose PHI other than as permitted or required by this Agreement or as required by law. Business Associate shall de-identify PHI prior to transmission unless the User opts not to de-identify.</p>
          <p className="mb-2">2.2. Safeguards: Business Associate agrees to use appropriate safeguards to prevent the use or disclosure of PHI other than as provided for by this Agreement, including the encryption of data to the highest level of encryption standards.</p>
          <p className="mb-2">2.3. Reporting: Business Associate shall report to User any use or disclosure of PHI not provided for by this Agreement of which it becomes aware within 15 days.</p>
          <p className="mb-4">2.4. Mitigation: Business Associate agrees to mitigate, to the extent practicable, any harmful effect that is known to Business Associate of a use or disclosure of PHI by Business Associate in violation of the requirements of this Agreement.</p>

          <h2 className="text-2xl font-bold mt-6 mb-4">3. Permitted Uses and Disclosures by Business Associate</h2>
          <p className="mb-2">3.1. General Use and Disclosure: Business Associate may use or disclose PHI only as necessary to perform the services outlined in this Agreement, provided that such use or disclosure would not violate HIPAA if done by User.</p>
          <p className="mb-2">3.2. De-Identification of PHI: Business Associate may use PHI to create de-identified information, provided that such de-identification is done in accordance with HIPAA standards.</p>
          <p className="mb-4">3.3. Subcontractors: Business Associate agrees to ensure that any agent, including a subcontractor, to whom it provides PHI agrees in writing to the same restrictions and conditions that apply to Business Associate with respect to such PHI.</p>

          <h2 className="text-2xl font-bold mt-6 mb-4">4. Term and Termination</h2>
          <p className="mb-2">4.1. Term: The Term of this Agreement shall commence as of the Effective Date and shall continue until terminated by either party in accordance with this Agreement.</p>
          <p className="mb-2">4.2. Termination for Cause: User may terminate this Agreement if it determines that Business Associate has violated a material term of this Agreement. Upon such termination, User shall provide written notice to Business Associate identifying the breach and providing an opportunity to cure within 30 days. If cure is not possible or not achieved within 30 days, User may immediately terminate the Agreement.</p>
          <p className="mb-4">4.3. Effect of Termination: Upon termination of this Agreement for any reason, Business Associate shall return or destroy all PHI received from User, or created or received by Business Associate on behalf of User, that Business Associate still maintains in any form. If return or destruction of PHI is not feasible, Business Associate agrees to extend the protections of this Agreement to such PHI and limit further uses and disclosures to those purposes that make the return or destruction of the PHI infeasible.</p>

          <h2 className="text-2xl font-bold mt-6 mb-4">5. Liability and Indemnification</h2>
          <p className="mb-4">5.1. Limitation of Liability: Except as otherwise provided in this Agreement or required by applicable law, Business Associate&apos;s total liability under this Agreement for any and all claims, damages, losses, or expenses, including attorneys&apos; fees, arising out of or in any way connected with the performance of services under this Agreement, shall not exceed the amount of fees paid by User to Business Associate for services provided under this Agreement in the 12 months preceding the event giving rise to the liability.</p>

          <h2 className="text-2xl font-bold mt-6 mb-4">6. Miscellaneous</h2>
          <p className="mb-2">6.1. Amendment: This Agreement may be amended only in writing signed by both parties.</p>
          <p className="mb-2">6.2. Governing Law: This Agreement shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflicts of law principles. Any legal action or proceeding arising under this Agreement will be brought exclusively in the courts of California.</p>
          <p className="mb-2">6.3. Entire Agreement: This Agreement constitutes the entire agreement between the parties with respect to the subject matter hereof and supersedes all prior agreements, understandings, and representations, whether oral or written.</p>
          <p className="mb-2">6.4. Breach Notification: Business Associate agrees to notify User within 15 days of discovering any breach of unsecured PHI in accordance with 45 CFR § 164.410.</p>
          <p className="mb-4">6.5. Survival: The obligations under Sections 4.3 (Effect of Termination) and 5 (Liability and Indemnification) shall survive the termination of this Agreement.</p>

          <p className="mt-8 mb-4">IN WITNESS WHEREOF, the parties hereto have executed this Agreement as of the Effective Date.</p>

          <div className="mt-8 grid grid-cols-2 gap-8">
            <div>
              <p className="font-bold">User</p>
              <p className="mt-4">By: __________________________</p>
              <p>Name: ________________________</p>
              <p>Title: _________________________</p>
              <p>Date: _________________________</p>
            </div>
            <div>
              <p className="font-bold">Melospeech Inc.</p>
              <p className="mt-4">By: __________________________</p>
              <p>Name: ________________________</p>
              <p>Title: _________________________</p>
              <p>Date: _________________________</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BAA;
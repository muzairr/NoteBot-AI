export default function GetStarted () {
    return (
        <div className="font-semibold flex flex-col items-center justify-center min-h-screen bg-white py-6">
        <div className="bg-white  rounded-lg p-8 max-w-4xl w-full">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-[#2b3990]">Get Started</h1>
            <p className="text-xl text-[#ed155a] mt-2">Choose Default or Customize</p>
            <p className="text-md underline text-[#2b3990] font-medium mt-2">
              Developer note: This can be a chatbot for ease.
            </p>
          </div>
          <div className="mt-6 text-center text-[#2b3990]">
            <p className="mb-4 text-[#ed155a]">
              Would you like to leave the settings to default or customize? For default in your note,
              your client will be called CLIENT, you will be called CLINICIAN, your note will be 
              transcribed in English no matter what language you speak, your note will be sent to 
              the email address you used to sign up and the subject of the email will be your Name, 
              the Date of the note, and the TIME of the note (e.g., Jenny Smith, 9/1/2024, 10:00 UTC).
            </p>
            <p className="font-bold">
              IF YES - then they are DONE and can start dictating the first note (next page)
            </p>
            <p className="font-bold mt-2">
              IF NO - Then move to customization in Chatbot as below
            </p>
      
            {/* Customization Questions */}
            <div className="mt-6 space-y-4">
              <p className='text-[#2b3990]'>
                <span className="font-bold text-[#ed155a]">What would you like your client to be called in your note? Student, Client, Child, Patient, by Name as stated </span>
                (Developer note, this will change 
                the prompt to replace the client&apos;s name with the choice selected).
              </p>
              <p className='text-[#2b3990]'>
              <span className="font-bold text-[#ed155a]">What would you like to be called in your note? Clinician, SLP, SLPA, Therapist, Other </span>
                (Developer note, this will change the prompt to 
                replace the clinician&apos;s name with the choice selected).
              </p>
              <p className='text-[#2b3990]'>
              <span className="font-bold text-[#ed155a]">What language would you like your note to be transcribed in? The default is the note transcribed in English, no matter what language you speak to 
                the tool. The language I speak to the tool, English, Spanish, Other </span>
                (Developer note, 
                this will change the prompt to replace the default language with the one selected).
              </p>
              <p className='text-[#ed155a]'>
                <span className="font-bold">Where would you like your notes sent? </span> Default is 
                the email address you used to sign up. Enter up to 3 default emails or choose to customize each time.
              </p>
              <p className='text-[#2b3990]'>
              <span className="font-bold text-[#ed155a]">What subject would you like in the email? Default 
                subject of the email will be your Name, the Date of the note, and the TIME of the note in 
                Universal Time. Default or Customize each time? </span>(Developer note, they can also edit the 
                default subject if needed).
              </p>
            </div>
            <p className="font-bold mt-6 text-[#ed155a]">Great! You&apos;re all done! Any questions for me? <a href="#contact" className="text-[#ed155a] underline">Contact Now!</a></p>
          </div>
        </div>
      </div>
    )
}
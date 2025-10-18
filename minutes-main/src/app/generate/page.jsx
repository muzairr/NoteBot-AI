"use client"
import React, { useState, useRef, useCallback, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import withAuth from '../components/auth/withAuth';
import { getUserSettings,updateUserCount } from '../../utils/user-settings';
import { sendEmail } from '../../utils/email-utils';
import { getCurrentUser,checkForPlan } from '../../utils/auth';
import LoggedInNavbar from '../components/LoggedInNavbar';
import { Mic, Upload, Loader2, Check, Download, Send, Edit2, PlusCircle } from 'lucide-react';
import { format } from 'date-fns';
import EmailInputModal from '../components/EmailInputModal'
import CustomSubjectModal from '../components/CustomSubjectModal'
import { Trash2 } from 'lucide-react';



const AudioTranscriptionApp = () => {


  
  // State management
  const [isRecording, setIsRecording] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [transcribedText, setTranscribedText] = useState('');  
  const [transcribedTextTranslate, setTranscribedTextTranslate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [isSentE, setIsSentE] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [userSettings, setUserSettings] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [isLoadingV,setIsLoadingV] = useState(false)
  const [emailTemp,setEmailTemp] = useState(false)
  
  const [pdfFile, setPdfFile] = useState(null);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [pdfUploadError, setPdfUploadError] = useState('');
  const [isPdfUploaded, setIsPdfUploaded] = useState(false);
  const [uploadedPdfName, setUploadedPdfName] = useState('');

  const [meetingType, setMeetingType] = useState('');
  const [meetingTypeError, setMeetingTypeError] = useState('');

  const [progressData, setProgressData] = useState({
    message: '',
    step: '',
    progress: 0
  });
  const [sessionId, setSessionId] = useState(null);


  let perNotes = false;

  // useEffect(() => {
  //   const verifyPlan = async () => {
  //     try {
  //       const paid = await checkForPlan();
  //       console.log(paid);
  
  //       if (paid) {
  //         console.log('Payment verified. Proceeding...');
  //         setIsLoadingV(false)
  //       } else {
  //         console.log('No active plan found. Redirecting...');
  //         window.location.href = '/payment';
  //       }
  //     } catch (error) {
  //       console.error('Error checking plan:', error.message);
  //     }
  //   };
  
  //   verifyPlan();
  // }, []);

  const resetState = () => {
    setIsRecording(false);
    setAudioFile(null);
    setTranscribedText('');
    setIsLoading(false);
    setIsGenerating(false);
    setIsSent(false);
    setIsSentE(false);
    setIsEditing(false);
    setError('');
    audioChunksRef.current = [];
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };
  const [permissionDenied, setPermissionDenied] = useState(false);

  // Refs
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);


    


  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setAudioFile(file);
  };

  const handleNewNote = () => {
    // Show confirmation dialog if there's unsaved work
    if (transcribedText && !isSent) {
      const confirmed = window.confirm('You have an unsent note. Are you sure you want to start a new note?');
      if (!confirmed) return;
    }
    resetState();
  };

  // Fetch user settings
  useEffect(() => {
    const fetchUserSettings = async () => {
      try {
        const user = await getCurrentUser();
        console.log(user)
        if (user?.email) {
          const settings = await getUserSettings(user.email);
  
          setUserSettings(settings);
        }
      } catch (error) {
        console.error('Error fetching user settings:', error);
      }
    };
    fetchUserSettings();
  }, []);

  useEffect(()=>{
    console.log(userSettings)
  },[userSettings])

  // Helper function to get supported MIME type
  const getMimeType = () => {
    const types = [
      'audio/webm',
      'audio/webm;codecs=opus',
      'audio/ogg;codecs=opus',
      'audio/mp4',
      'audio/wav',
      'audio/x-wav'
    ];
    
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    
    return ''; // Fall back to browser default
  };

  // Recording functions
  const startRecording = useCallback(async () => {
    setError('');
    setAudioFile(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 44100,
          sampleSize: 16,
          volume: 1
        }
      });

      streamRef.current = stream;
      const mimeType = getMimeType();
      
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: mimeType,
        audioBitsPerSecond: 128000
      });

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioFile(audioBlob);
        
        // Clean up stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorderRef.current.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setError('An error occurred while recording. Please try again.');
      };

      mediaRecorderRef.current.start(100); // Collect data every 100ms
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing the microphone:', error);
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setPermissionDenied(true);
        setError('Microphone permission was denied. Please enable it in your browser settings.');
      } else {
        setError('Error accessing your microphone. Please check your settings.');
      }
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Clean up stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  }, [isRecording]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // const handleFileUpload = (event) => {
  //   const file = event.target.files[0];
  //   if (file) {
  //     // Validate file type and size
  //     const validTypes = ['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/webm', 'audio/ogg'];
  //     if (!validTypes.includes(file.type)) {
  //       setError('Please upload a valid audio file (WAV, MP3, WebM, or OGG)');
  //       return;
  //     }
      
  //     if (file.size > 50 * 1024 * 1024) { // 50MB limit
  //       setError('File size must be less than 50MB');
  //       return;
  //     }
      
  //     setAudioFile(file);
  //     setError('');
  //   }
  // };

  const getFormattedTimestamp = () => {
    const now = new Date();
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return format(now, "M/d/yyyy, h:mm:ss a") + ` (${timeZone})`;
  };

const handleSubmit = async () => {
  if (!audioFile) return;

  if (!meetingType) {
    setMeetingTypeError('Please select a meeting type.');
    return;
  }

  setIsLoading(true);
  setIsGenerating(true);
  setError('');
  setMeetingTypeError('');
  
  // Reset progress
  setProgressData({ message: 'Initializing...', step: 'start', progress: 0 });

  // Generate session ID on frontend first
  const generatedSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  setSessionId(generatedSessionId);
  
  // Start listening to progress BEFORE making the upload request
  const eventSource = listenToProgress(generatedSessionId);

  const formData = new FormData();
  const fileName = audioFile instanceof File ? audioFile.name : 'recorded_audio.wav';
  formData.append('audio', audioFile, fileName);
  formData.append('meetingType', meetingType);
  formData.append('uploadedPdfName', uploadedPdfName);
  formData.append('sessionId', generatedSessionId); // Send the session ID

  try {
    const response = await axios.post('http://192.168.100.22:4000/upload-chunked-windows', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      withCredentials: true,
      timeout: 12000000
    });
    
    setTranscribedText(response.data.gptText);
    setTranscribedTextTranslate(response.data.transcription);
    
  } catch (error) {
    console.error('Error processing audio:', error);
    eventSource.close(); // Close progress stream on error
    
    if (error.response?.data?.sizeError) {
      setError(error.response.data.sizeError);
    } else {
      setError('Unable to generate note. Please check your microphone and contact support if this issue continues.');
    }
  } finally {
    setIsLoading(false);
    setIsGenerating(false);
    // eventSource will auto-close when progress reaches 100%
  }
};

const listenToProgress = (sessionId) => {
  const eventSource = new EventSource(`http://192.168.100.22:4000/progress/${sessionId}`);
  
  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      setProgressData({
        message: data.message,
        step: data.step,
        progress: data.progress || 0
      });
      
      // Close connection when completed
      if (data.step === 'completed' || data.step === 'error') {
        eventSource.close();
      }
    } catch (err) {
      console.error('Error parsing progress data:', err);
    }
  };
  
  eventSource.onerror = (error) => {
    console.error('Progress stream error:', error);
    eventSource.close();
  };
  
  return eventSource; // Return so we can close it if needed
};

  const handleEdit = () => setIsEditing(true);
  const handleSave = () => setIsEditing(false);

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([transcribedText], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `minutes_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

    const handleTranscriptionDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([transcribedTextTranslate], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `transcription_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleSend = async (customEmails = null, customSubject = null) => {
    try {
      setIsLoading(true);
      setError('');
      
      const user = await getCurrentUser();
      const settings = await getUserSettings(user.email);
      const count = settings?.count?.limit || 0;
      const lastUpdate = settings?.count?.lastUpdate;
      
      
      let emailsToSend;
      
      if (customEmails && Array.isArray(customEmails)) {
        emailsToSend = customEmails;
        if(settings?.settings?.subjectLinePreference === 'per_note'){          
        setEmailTemp(customEmails)
        }
      } else if (settings?.settings?.emailPreference === 'per_note') {
        if(!emailTemp){
          setShowEmailModal(true);
          setIsLoading(false);
          return;
        }
      } else if (settings?.settings?.emailPreference === 'per_note') {
        setShowEmailModal(true);
        setIsLoading(false);
        return;
      } 
      else if (settings?.settings?.emailPreference === 'custom_emails' && 
                 Array.isArray(settings.settings.customEmails) && 
                 settings.settings.customEmails.length > 0) {
        emailsToSend = settings.settings.customEmails;
      } else {
        emailsToSend = [user.email];
      }
  
      // Determine the subject line
      console.log(customSubject)

      let subjectLine;
      if (customSubject) {
        // Case 1: Custom subject provided from modal
        subjectLine = customSubject;
        if(settings?.settings?.emailPreference === 'per_note'){
          emailsToSend=emailTemp
          console.log(emailsToSend)

        }
      } else if (settings?.settings?.subjectLinePreference === 'per_note') {
        setShowSubjectModal(true);
        setIsLoading(false);
        return; // Exit early to show modal
      } else if (settings?.settings?.subjectLinePreference === 'custom' && 
                 settings.settings.customSubject) {
        // Case 3: Use custom subject format from settings
        // Replace placeholders with actual values
        let subject = settings.settings.customSubject;
        const timestamp = getFormattedTimestamp();
        subject = subject
          .replace('[Date]', timestamp.split(',')[0])
          .replace('[Time]', timestamp.split(',')[1])
          .replace('[Name]', user.name || '')
        subjectLine = subject;
      } else {
        // Case 4: Default subject line
        subjectLine = `DO NOT REPLY - Session Note ${getFormattedTimestamp()}`;
      }
  
      console.log(emailsToSend)
      // Only proceed with sending if we have emails
      if (emailsToSend && emailsToSend.length > 0) {
        console.log(emailsToSend+count)
        const currentTime = new Date();
        let resetLimit = false;

        if (lastUpdate) {
          const lastUpdateTime = new Date(lastUpdate);
          const timeDifference = (currentTime - lastUpdateTime) / (1000 * 3600); // Difference in hours
          if (timeDifference >= 24) {
            resetLimit = true;
          }
        } else {
          resetLimit = true; // No lastUpdate means it's time to reset
        }
        const newCount = resetLimit ? emailsToSend.length : count + emailsToSend.length;
        if (newCount < 100) {
          // Update the count if within the limit
          await updateUserCount(user.email, emailsToSend.length);
          await sendEmail(
            emailsToSend,
            subjectLine,
            transcribedText + "\n\n Do not reply to this message. This mailbox is NOT monitored. For assistance, please email help@slpeace.com."
          );
        setIsSent(true);
        setIsSentE(false);
          console.log('Count updated successfully.');
        }else {
          // Set canSendEmails to false if limit exceeded
          const canSendEmails = false;
          console.log('Email sending limit exceeded.', { canSendEmails });
          setIsSent(false);
        setIsSentE(true);
        }
        setShowEmailModal(false);
        setShowSubjectModal(false);
        setError('');
      } else {
        throw new Error('No valid email addresses provided');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      setError('Failed to send email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePdfFileChange = (e) => {
  setPdfUploadError('');
  const file = e.target.files[0];
  if (file && file.type === 'application/pdf') {
    setPdfFile(file);
  } else {
    setPdfUploadError('Please select a valid PDF file.');
    setPdfFile(null);
  }
};

const handlePdfUpload = async () => {
  if (!pdfFile) {
    setPdfUploadError('No PDF file selected.');
    return;
  }

  setIsUploadingPdf(true);
  setPdfUploadError('');
  setIsPdfUploaded(false);

  const formData = new FormData();
  formData.append('pdf', pdfFile, pdfFile.name);

  try {
    const response = await axios.post('http://192.168.100.22:4000/upload-pdf', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (response.status === 200) {
      setIsPdfUploaded(true);
      setUploadedPdfName(pdfFile.name); // ✅ Store the filename
      setPdfFile(null);
    } else {
      setPdfUploadError('Failed to upload PDF.');
    }
  } catch (err) {
    setPdfUploadError('Error uploading PDF: ' + err.message);
  } finally {
    setIsUploadingPdf(false);
  }
};




  if(isLoadingV){
    return( 
      <div className="fixed inset-0 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>)  
    }

return (
  <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
    <LoggedInNavbar />
    <div className="max-w-4xl mx-auto p-4 pt-8">
      <main className="bg-white rounded-xl shadow-xl p-8">
        {transcribedText && (
          <div className="mb-6 flex justify-end">
            <button
              onClick={handleNewNote}
              className="flex items-center space-x-2 px-4 py-2 bg-[#2b3990] text-white rounded-lg hover:bg-[#232d73] transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Note</span>
            </button>
          </div>
        )}

        {!transcribedText ? (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-[#2b3990] mb-4">Ready to Dictate a Note</h2>
            <p className="text-gray-600 mb-8">
              Ready to summarize your session? Hit the microphone and speak naturally. Share a short summary!
            </p>

            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <input
                  id="file-upload"
                  type="file"
                  onChange={handleFileUpload}
                  accept="audio/*"
                  className="hidden"
                  disabled={!!audioFile}
                />
                <label
                  htmlFor="file-upload"
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg cursor-pointer transition-colors ${
                    audioFile ? 'bg-gray-200 text-gray-600 cursor-not-allowed' : 'bg-[#2b3990] text-white hover:bg-[#232d73]'
                  }`}
                >
                  <Upload className="w-5 h-5" />
                  <span>Upload Audio File</span>
                </label>
              </div>

              {/* Select Meeting Type Dropdown */}
              <div className="w-full max-w-xs">
                <label htmlFor="meetingType" className="block mb-1 text-sm font-medium text-gray-700">
                  Select Meeting Type
                </label>
                <select
                  id="meetingType"
                  value={meetingType}
                  onChange={(e) => setMeetingType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2b3990] focus:outline-none text-gray-700"
                >
                  <option value="">-- Choose --</option>
                  <option value="Board Meeting">Board Meeting</option>
                  <option value="Internal Meeting">Internal Meeting</option>
                </select>
                {meetingTypeError && <div className="text-red-500 text-sm mt-1">{meetingTypeError}</div>}
              </div>

              {/* Upload PDF Section */}
              <div className="space-y-4 mt-8 items-center justify-center flex flex-col">
                <h3 className="text-xl font-semibold text-[#2b3990]">Upload a PDF File</h3>
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handlePdfFileChange}
                    className="block text-sm text-gray-600"
                  />
                  <button
                    onClick={handlePdfUpload}
                    disabled={isUploadingPdf || !pdfFile}
                    className={`px-4 py-2 rounded-lg text-white ${
                      isUploadingPdf || !pdfFile
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-[#2b3990] hover:bg-[#232d73]'
                    } transition-colors`}
                  >
                    {isUploadingPdf ? 'Uploading...' : 'Upload PDF'}
                  </button>
                </div>
                {pdfUploadError && <div className="text-red-500 text-sm">{pdfUploadError}</div>}

                {isPdfUploaded && uploadedPdfName && (
                  <div className="flex items-center space-x-2 text-green-600 mt-2 text-sm bg-green-50 border border-green-200 px-4 py-2 rounded-md">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>
                      You’ve uploaded <span className="font-semibold">{uploadedPdfName}</span> and are currently using it.
                    </span>
                  </div>
                )}
              </div>

{/* Generate Note Button with Integrated Progress */}
{audioFile && (
  <div className="w-full space-y-4">
    <button
      onClick={handleSubmit}
      disabled={isGenerating }
      className={`flex items-center space-x-2 px-6 py-3 rounded-lg bg-[#262e75] text-white hover:bg-[#262e75] transition-colors w-full justify-center ${
        isGenerating || !meetingType ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'
      }`}
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>
            {progressData.progress > 0 ? `${progressData.progress}%` : 'Generating...'}
          </span>
        </>
      ) : (
        <span>Generate Note</span>
      )}
    </button>

    {/* Progress Section - Only show when generating */}
    {isGenerating && (
      <div className="w-full space-y-4 p-4 bg-gray-50 rounded-lg border">
        {/* Progress Bar */}
        <div className="w-full">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span className="font-medium">{progressData.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-[#262e75] h-full rounded-full transition-all duration-500 ease-out relative"
              style={{ width: `${progressData.progress}%` }}
            >
              {/* Animated shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
            </div>
          </div>
        </div>
        
        {/* Current Status */}
        <div className="text-center space-y-2">
          <p className="text-lg font-medium text-gray-800 min-h-[28px]">
            {progressData.message || 'Processing...'}
          </p>
          
          {/* Step Indicator */}
          {progressData.step && (
            <div className="flex items-center justify-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                progressData.step === 'initialization' ? 'bg-[#262e75] animate-pulse' : 
                progressData.step === 'pdf_extraction' ? 'bg-[#262e75] animate-pulse' :
                progressData.step === 'audio_splitting' ? 'bg-[#262e75] animate-pulse' :
                progressData.step === 'transcription' ? 'bg-[#262e75] animate-pulse' :
                progressData.step === 'segmentation' ? 'bg-[#262e75] animate-pulse' :
                progressData.step === 'formatting' ? 'bg-[#262e75] animate-pulse' :
                progressData.step === 'completed' ? 'bg-green-500' :
                'bg-gray-300'
              }`}></div>
              <p className="text-sm text-gray-600 capitalize">
                {progressData.step.replace('_', ' ')}
              </p>
            </div>
          )}
        </div>
        
        {/* Progress Steps Indicator */}
        <div className="flex justify-between text-xs text-gray-500 px-1">
          <span className={progressData.progress >= 5 ? 'text-[#262e75] font-medium' : ''}>
            Init
          </span>
          <span className={progressData.progress >= 20 ? 'text-[#262e75] font-medium' : ''}>
            Split
          </span>
          <span className={progressData.progress >= 30 ? 'text-[#262e75] font-medium' : ''}>
            Transcribe
          </span>
          <span className={progressData.progress >= 75 ? 'text-[#262e75] font-medium' : ''}>
            Segment
          </span>
          <span className={progressData.progress >= 85 ? 'text-[#262e75] font-medium' : ''}>
            Format
          </span>
          <span className={progressData.progress >= 100 ? 'text-green-600 font-medium' : ''}>
            Done
          </span>
        </div>
        
        {/* Time Estimate */}
        {progressData.progress > 5 && progressData.progress < 100 && (
          <div className="text-center">
            <p className="text-xs text-gray-400">
              {progressData.progress < 25 && "🔄 Processing audio file..."}
              {progressData.progress >= 25 && progressData.progress < 70 && "🎙️ Converting speech to text..."}
              {progressData.progress >= 70 && progressData.progress < 90 && "📝 Formatting meeting minutes..."}
              {progressData.progress >= 90 && progressData.progress < 100 && "✨ Almost ready..."}
            </p>
          </div>
        )}
        
        {/* Success Message */}
        {progressData.step === 'completed' && (
          <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                </svg>
              </div>
              <p className="text-green-700 font-medium">Meeting minutes generated successfully!</p>
            </div>
          </div>
        )}
        
        {/* Error Message */}
        {progressData.step === 'error' && (
          <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                </svg>
              </div>
              <p className="text-red-700 font-medium">Processing failed. Please try again.</p>
            </div>
          </div>
        )}
      </div>
    )}
  </div>
)}

              {/* Error Message */}
              {error && <div className="text-red-600 mt-4 text-center"><span>{error}</span></div>}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Transcribed Text */}
            <h2 className="text-3xl font-bold text-[#2b3990] mb-6">Note Generated</h2>
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-12 h-12 animate-spin text-[
#2b3990]" />
              </div>
            ) : (
              <div className="space-y-6">
                {isEditing ? (
                  <div className="space-y-4">
                    <textarea
                      value={transcribedText}
                      onChange={(e) => setTranscribedText(e.target.value)}
                      className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2b3990] focus:border-transparent min-h-[200px] text-gray-800"
                      rows="10"
                    />
                    <button
                      onClick={handleSave}
                      className="w-full py-3 bg-[#2b3990] text-white rounded-lg hover:bg-[#232d73] transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <div className="text-sm text-gray-600 mb-4 pb-4 border-b border-gray-200">
                      Subject: Session Note {getFormattedTimestamp()}
                    </div>
                    <div className="prose max-w-none text-gray-800 whitespace-pre-wrap">
                      {transcribedText}
                    </div>
                  </div>
                )}

                <div className="flex justify-center space-x-4">
                  <button
                    onClick={handleDownload}
                    className="flex items-center space-x-2 px-6 py-3 bg-[#2b3990] text-white rounded-lg hover:bg-[#232d73] transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                                    <button
                    onClick={handleTranscriptionDownload}
                    className="flex items-center space-x-2 px-6 py-3 bg-[#2b3990] text-white rounded-lg hover:bg-[#232d73] transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Transcript</span>
                  </button>
                </div>

                {isSent && (
                  <div className="flex items-center justify-center space-x-2 text-green-500 font-medium">
                    <Check className="w-5 h-5" />
                    <span>Note sent successfully!</span>
                  </div>
                )}
                {!isSent && isSentE && (
                  <div className="flex items-center justify-center space-x-2 text-red-500 font-medium">
                    <Check className="w-5 h-5" />
                    <span>You have reached your maximum email usage for the day. Please try again tomorrow. You may also download your note to save it.</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  </div>
);


}


export default withAuth(AudioTranscriptionApp);
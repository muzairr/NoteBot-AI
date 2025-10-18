// app/settings/page.jsx
"use client"
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '../../utils/auth';
import { getUserSettings, saveUserSettings } from '../../utils/user-settings';
import FirstTimeSettings from '../components/FirstTimeSettings';
import { Loader2 } from 'lucide-react';
import RegularSettings from '../components/RegularSettings';
import LoggedInNavbar from '../components/LoggedInNavbar';
import withAuth from '../components/auth/withAuth';

const Settings = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [currentSettings, setCurrentSettings] = useState(null);

  useEffect(() => {
    const checkUserSettings = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          router.push('/signin');
          return;
        }

        setUserEmail(user.email);
        const settings = await getUserSettings(user.email);
        
        if (!settings) {
          // If no settings exist, initialize them
          // await initializeUserSettings(user.email);
          setIsFirstTime(true);
        } else {
          setCurrentSettings(settings);
          setIsFirstTime(settings.settings.firstTimeLogin);
        }
      } catch (error) {
        console.error('Error checking settings:', error);
        // If there's an error, assume first time setup is needed
        setIsFirstTime(true);
      } finally {
        setLoading(false);
      }
    };

    checkUserSettings();
  }, []);

  const handleSettingsUpdate = async (updatedSettings) => {
    try {
      await saveUserSettings(userEmail, updatedSettings);
      setCurrentSettings(updatedSettings);
      return true;
    } catch (error) {
      console.error('Error saving settings:', error);
      return false;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-pink-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#2b3990]" />
      </div>
    );
  }

  if (isFirstTime) {
    return <FirstTimeSettings />;
  }

  return (
    <div>
      <LoggedInNavbar />
      <RegularSettings 
        currentSettings={currentSettings} 
        onSave={handleSettingsUpdate}
        userEmail={userEmail}
      />
<div className="flex justify-center my-10">
  <a 
    href="https://www.trustpilot.com/review/slpeace.com" 
    className="flex w-fit items-center justify-center space-x-2 border border-[#00B67A] text-[#00B67A] font-medium py-2 px-4  "
  >
    <span className='text-black'>Review us on</span>
    <img src="/trustpilot.svg" alt="Trustpilot" className="h-5" />
  </a>
</div>


    </div>
  );
}

export default withAuth(Settings)
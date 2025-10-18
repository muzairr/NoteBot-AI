// components/auth/withAuthRedirect.js
"use client"

import { useEffect,useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '../../../utils/auth';

export function withAuthRedirect(WrappedComponent, options = { requireAuth: true }) {
  return function WithAuthRedirect(props) {
    const router = useRouter();

    useEffect(() => {
      const checkAuth = async () => {
        try {
          const user = await getCurrentUser();
          
          if (user && !options.requireAuth) {
            // If user is logged in and page doesn't require auth (like signin/signup)
            router.push('/generate');
          } else if (!user && options.requireAuth) {
            // If user is not logged in and page requires auth
            router.push('/signin');
          }
        } catch (error) {
          if (options.requireAuth) {
            router.push('/signin');
          }
        }
      };

      checkAuth();
    }, []);

    return <WrappedComponent {...props} />;
  };
}




export function withAuthCheck(WrappedComponent) {
  const WithAuth = (props) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      getCurrentUser()
        .then((user) => {
          // Check if the user has the required plan
          if (!user?.['custom:plan'] || user?.['custom:plan'] !== 'Professional') {
            router.push('/generate');
          } else {
            setIsLoading(false); // User is authenticated and has the correct plan
          }
        })
        .catch(() => router.replace('/signin')); // Redirect to sign-in if authentication fails
    }, [router]); // Added router to the dependency array

    if (isLoading) {
      return (
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };

  WithAuth.displayName = `WithAuth(${getDisplayName(WrappedComponent)})`;
  return WithAuth;
}

// Helper function to get the display name of a component
function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

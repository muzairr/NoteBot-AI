"use client"
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function withAuth(WrappedComponent) {
  const WithAuth = (props) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const token = localStorage.getItem('token');

      if (!token) {
        router.replace('/signin');
        return;
      }

      fetch('http://192.168.100.22:4000/me', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then((res) => {
          if (!res.ok) throw new Error('Unauthorized');
          return res.json();
        })
        .then(() => setIsLoading(false))
        .catch(() => router.replace('/signin'));
    }, [router]);

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

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

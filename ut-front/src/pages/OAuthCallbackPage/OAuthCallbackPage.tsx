import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const OAuthCallbackPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userRaw = params.get('user');

    if (token && userRaw) {
      try {
        const user = JSON.parse(decodeURIComponent(userRaw));
        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(user));
        navigate('/dashboard', { replace: true });
      } catch {
        navigate('/login?error=oauth_failed', { replace: true });
      }
    } else {
      navigate('/login?error=oauth_failed', { replace: true });
    }
  }, [navigate]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <p style={{ fontFamily: 'sans-serif', color: '#718096' }}>Signing you in...</p>
    </div>
  );
};

export default OAuthCallbackPage;

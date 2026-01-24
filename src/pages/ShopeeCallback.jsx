
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

const ShopeeCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const shop_id = searchParams.get('shop_id');
      
      if (!code || !shop_id) {
        setStatus('error');
        setError('Missing required parameters from Shopee.');
        return;
      }

      try {
        const { data, error: fnError } = await supabase.functions.invoke('shopee-auth-callback', {
          body: { code, shop_id }
        });

        if (fnError) throw fnError;
        
        setStatus('success');
        setTimeout(() => {
          navigate('/admin/settings');
        }, 2000);
      } catch (e) {
        setStatus('error');
        setError(e.message || "Failed to exchange token.");
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4">
      {status === 'processing' && (
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto" />
          <h2 className="text-xl text-white font-semibold">Connecting to Shopee...</h2>
          <p className="text-gray-500">Please wait while we secure the connection.</p>
        </div>
      )}
      
      {status === 'success' && (
        <div className="text-center space-y-4">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
          <h2 className="text-xl text-white font-semibold">Success!</h2>
          <p className="text-gray-500">Redirecting back to settings...</p>
        </div>
      )}

      {status === 'error' && (
        <div className="text-center space-y-4">
          <XCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-xl text-white font-semibold">Connection Failed</h2>
          <p className="text-red-400">{error}</p>
          <button 
            onClick={() => navigate('/admin/settings')}
            className="text-gray-400 hover:text-white underline mt-4 block"
          >
            Return to Settings
          </button>
        </div>
      )}
    </div>
  );
};

export default ShopeeCallback;

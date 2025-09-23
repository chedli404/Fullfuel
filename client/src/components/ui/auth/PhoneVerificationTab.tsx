
import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { Button } from '@/components/ui/button';

declare global {
  interface Window {
    recaptchaVerifier?: any;
  }
}

interface PhoneVerificationTabProps {
  phoneNumber: string;
  email: string;
}

export function PhoneVerificationTab({ phoneNumber, email }: PhoneVerificationTabProps) {
  const [code, setCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [showEmailFallback, setShowEmailFallback] = useState(false);
  const [emailFallbackMessage, setEmailFallbackMessage] = useState('');
  const [method, setMethod] = useState<'choice' | 'sms' | 'email'>('choice');

  const handleSendEmailVerification = async () => {
    setMethod('email');
    setEmailFallbackMessage('Envoi du lien de vérification...');
    try {
      const response = await fetch('/api/auth/send-email-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (response.ok) {
        setEmailFallbackMessage('✅ Lien de vérification envoyé à votre email.');
      } else {
        setEmailFallbackMessage('Erreur lors de l\'envoi du lien.');
      }
    } catch (err: any) {
      setEmailFallbackMessage('Erreur: ' + err.message);
    }
  };

  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  const sendCode = async () => {
    setMethod('sms');
    setSending(true);
    setMessage('');
    try {
      if (!phoneNumber || phoneNumber.length < 10) {
        throw new Error('Numéro de téléphone invalide');
      }
      // Essayer Firebase d'abord
      try {
        if (!window.recaptchaVerifier) {
          window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            size: 'invisible',
            callback: () => console.log('reCAPTCHA résolu'),
            'expired-callback': () => {
              setMessage('reCAPTCHA expiré, veuillez réessayer');
              window.recaptchaVerifier = null;
            }
          });
        }
        const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
        const result = await signInWithPhoneNumber(auth, formattedPhone, window.recaptchaVerifier);
        setConfirmationResult(result);
        setMessage('Code envoyé avec succès!');
        return;
      } catch (firebaseErr: any) {
        console.error('Firebase SMS Error:', firebaseErr);
        // Always show email fallback on any SMS error
        setShowEmailFallback(true);
        setMessage('⚠️ Impossible d\'envoyer le SMS. Essayez la vérification par email.');
        // Try fallback SMS service if billing-not-enabled
        if (firebaseErr.code === 'auth/billing-not-enabled') {
          console.log('Trying alternative SMS service...');
          try {
            const response = await fetch('/api/auth/send-sms', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ phoneNumber: phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}` }),
            });
            if (response.ok) {
              // Try to parse JSON, but catch if it's HTML
              let data;
              try {
                data = await response.json();
              } catch (jsonErr) {
                setMessage('Erreur: le service SMS alternatif ne répond pas correctement.');
                return;
              }
              setConfirmationResult({ 
                verificationId: data.verificationId,
                confirm: async (code: string) => {
                  const verifyResponse = await fetch('/api/auth/verify-sms', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ verificationId: data.verificationId, code }),
                  });
                  if (!verifyResponse.ok) throw new Error('Code invalide');
                  return { user: { getIdToken: async () => 'custom-token' } };
                }
              });
              setMessage('Code envoyé via service alternatif!');
              return;
            } else {
              setMessage('Erreur: le service SMS alternatif est indisponible.');
            }
          } catch (altErr) {
            setMessage('Erreur: le service SMS alternatif a échoué.');
          }
        }
      }
    } catch (err: any) {
      console.error('Erreur SMS:', err);
      // Always show email fallback on any error
      setShowEmailFallback(true);
      if (err.code === 'auth/invalid-phone-number') {
        setMessage('Numéro de téléphone invalide');
      } else {
        setMessage('Erreur: ' + err.message);
      }
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    } finally {
      setSending(false);
    }
  };

  const verifyCode = async () => {
    if (!code || code.length !== 6) {
      setMessage('Veuillez entrer un code à 6 chiffres');
      return;
    }
    setVerifying(true);
    setMessage('');
    try {
      const result = await confirmationResult.confirm(code);
      const idToken = await result.user.getIdToken();
      // Choisir l'endpoint selon le type de token
      const endpoint = idToken === 'custom-token' ? '/api/auth/verify-custom-phone' : '/api/auth/verify-firebase-phone';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      if (!response.ok) {
        throw new Error('Erreur de vérification côté serveur');
      }
      setMessage('✅ Téléphone vérifié avec succès!');
    } catch (err: any) {
      if (err.code === 'auth/invalid-verification-code') {
        setMessage('Code de vérification invalide');
      } else if (err.code === 'auth/code-expired') {
        setMessage('Code expiré. Demandez un nouveau code.');
      } else {
        setMessage('Échec de la vérification: ' + err.message);
      }
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-4">
      {method === 'choice' && (
        <>
          <div className="text-sm text-gray-600 mb-2">Choisissez la méthode de vérification :</div>
          <Button onClick={() => setMethod('sms')} className="w-full mb-2">Vérifier par SMS</Button>
          <Button onClick={handleSendEmailVerification} className="w-full" variant="outline">Vérifier par Email</Button>
          {emailFallbackMessage && (
            <div className="text-xs text-center text-green-600 mt-2">{emailFallbackMessage}</div>
          )}
        </>
      )}
      {method === 'sms' && (
        <>
          <div className="text-sm text-gray-600">Téléphone: {phoneNumber}</div>
          <div id="recaptcha-container" className="mb-2" />
          <Button onClick={sendCode} disabled={sending || !!confirmationResult} className="w-full">
            {sending ? 'Envoi...' : confirmationResult ? 'Code Envoyé' : 'Envoyer le Code'}
          </Button>
          <input
            type="text"
            placeholder="Entrez le code de vérification (6 chiffres)"
            maxLength={6}
            value={code}
            onChange={e => setCode(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
          <Button onClick={verifyCode} disabled={!confirmationResult || verifying || !code} className="w-full">
            {verifying ? 'Vérification...' : 'Vérifier'}
          </Button>
          <div className="text-sm text-center text-muted-foreground mt-2">{message}</div>
          <div className="text-xs text-gray-500">
            État: {confirmationResult ? 'Code envoyé' : 'En attente'}
          </div>
          <div className="text-xs text-blue-600 mt-1">
            💡 Si Firebase ne fonctionne pas, activez le plan Blaze (gratuit jusqu'à 10 SMS/mois)
          </div>
          {showEmailFallback && (
            <div className="mt-4">
              <Button onClick={() => setMethod('email')} className="w-full" variant="outline">
                Recevoir un lien de vérification par email
              </Button>
            </div>
          )}
        </>
      )}
      {method === 'email' && (
        <>
          <div className="text-sm text-gray-600 mb-2">Un lien de vérification sera envoyé à : <b>{email}</b></div>
          <Button onClick={handleSendEmailVerification} className="w-full" variant="outline">
            Envoyer le lien de vérification
          </Button>
          {emailFallbackMessage && (
            <div className="text-xs text-center text-green-600 mt-2">{emailFallbackMessage}</div>
          )}
        </>
      )}
    </div>
  );
}



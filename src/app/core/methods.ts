export const firebaseErrorMessages: Record<string, string> = {
  'auth/invalid-email': '📧 Invalid email format.',
  'auth/user-disabled': '🚫 This account has been disabled.',
  'auth/user-not-found': '🙁 No user found with this email.',
  'auth/wrong-password': '🔑 Incorrect password.',
  'auth/email-already-in-use': '📧 This email is already registered.',
  'auth/weak-password': '🔒 Password is too weak.',
  'auth/invalid-credential': '⚠️ Invalid email or password!',
  'auth/account-exists-with-different-credential':
    '🔀 This email is already linked with another login method.',
  'auth/requires-recent-login': '⏳ Please log in again to continue.',
  'auth/network-request-failed': '🌐 Network error. Check your connection.',
  'auth/too-many-requests': '😵 Too many attempts. Try again later.',
  'auth/popup-closed-by-user': '❌ Login popup closed before completion.',
  'auth/operation-not-allowed': '⚠️ This sign-in method is not enabled.',
  'auth/missing-email': '📧 Email is required.',
  'auth/internal-error': '⚠️ Internal error. Please try again.',
  'auth/captcha-check-failed': '🤖 CAPTCHA verification failed.',
  'auth/unverified-email': '📩 Please verify your email before signing in.',
  'auth/timeout': '⏲️ Request timed out. Try again.',
  'auth/app-not-authorized': '🚫 App not authorized for this request.',
  'auth/invalid-api-key': '🔑 Invalid API key. Check your Firebase config.',
  'auth/quota-exceeded': '📉 Quota exceeded. Try again later.',
  'auth/id-token-expired': '⏳ Session expired. Please log in again.',
  'auth/invalid-verification-code': '❌ Invalid verification code.',
  'auth/invalid-verification-id': '⚠️ Invalid verification ID.',
  'auth/missing-verification-code': '📩 Verification code is missing.',
  'auth/missing-verification-id': '⚠️ Verification ID is missing.',
  'auth/credential-already-in-use': '🔑 This credential is already in use.',
  'auth/provider-already-linked': '🔗 Provider already linked to this account.',
  'auth/no-such-provider': '🚫 Provider not available.',
  'auth/unauthorized-domain': '🌍 Unauthorized domain for this operation.',
};

export function getFirebaseErrorMessage(code: string): string {
  return firebaseErrorMessages[code] || '❓ An unknown error occurred.';
}

export function changeTheme() : string{
    const root = document.documentElement;
    root.classList.toggle("light-theme");
    root.classList.toggle("dark-theme");
    let theme = '';
    if(root.classList.contains("light-theme")){
      theme = "light";
    } else {
      theme = "dark";
    }
    localStorage.setItem("theme", theme);
    return theme;
}

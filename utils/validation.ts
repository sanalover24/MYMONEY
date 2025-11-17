export interface PasswordStrength {
  score: number; // 0-5
  criteria: {
    length: boolean;
    number: boolean;
    uppercase: boolean;
    lowercase: boolean;
    specialChar: boolean;
  };
}

export const calculatePasswordStrength = (password: string): PasswordStrength => {
  const criteria = {
    length: password.length >= 8,
    number: /\d/.test(password),
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const score = Object.values(criteria).filter(Boolean).length;

  return { score, criteria };
};

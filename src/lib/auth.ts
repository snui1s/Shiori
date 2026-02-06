export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (!password || password.length < 8) {
    return { isValid: false, message: 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร' };
  }
  return { isValid: true };
};

export const validateRegistration = (name: string, email: string, password: string) => {
  if (!name || !email || !password) {
    return { isValid: false, message: 'กรุณากรอกข้อมูลให้ครบถ้วน' };
  }
  
  if (!validateEmail(email)) {
    return { isValid: false, message: 'รูปแบบอีเมลไม่ถูกต้อง' };
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    return { isValid: false, message: passwordValidation.message };
  }

  return { isValid: true };
};

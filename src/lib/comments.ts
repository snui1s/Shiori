export const validateCommentContent = (content: string): { isValid: boolean; message?: string } => {
  const trimmed = content.trim();
  if (!trimmed) {
    return { isValid: false, message: 'กรุณาพิมพ์ข้อความก่อนส่งนะจ๊ะ' };
  }
  if (trimmed.length < 2) {
    return { isValid: false, message: 'คอมเมนต์สั้นไปนิด ลองพิมพ์เพิ่มอีกหน่อยเนอะ' };
  }
  if (trimmed.length > 1000) {
    return { isValid: false, message: 'คอมเมนต์ยาวเกินไปหน่อยนะ (จำกัด 1,000 ตัวอักษร)' };
  }
  return { isValid: true };
};

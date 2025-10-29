export const validateEmail = (value) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!value) return "";
  if (!emailRegex.test(value)) return "Alamat email tidak valid";

  return "";
};

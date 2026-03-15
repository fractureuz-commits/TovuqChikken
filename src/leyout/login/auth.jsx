import { Preferences } from '@capacitor/preferences';
import Swal from 'sweetalert2';

export const loginUser = async (data) => {
  await Preferences.set({
    key: 'auth',
    value: JSON.stringify(data), // ✅ hamma field avtomatik saqlanadi
  });
};

export const logoutUser = async () => {
  const result = await Swal.fire({
    title: "Chiqishni xohlaysizmi?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Ha, chiqish",
    cancelButtonText: "Bekor qilish",
    confirmButtonColor: "#e74c3c",
    cancelButtonColor: "#95a5a6",
  });

  if (result.isConfirmed) {
    await Preferences.remove({ key: 'auth' });
    await Preferences.remove({ key: 'pin' });
    await Preferences.remove({ key: 'pinSet' });
    window.location.reload();
  }
};

export const isAuthenticated = async () => {
  const { value } = await Preferences.get({ key: 'auth' });
  if (!value) return false;
  const user = JSON.parse(value);
  return !!user?.id; 
};

export const getUser = async () => {
  const { value } = await Preferences.get({ key: 'auth' });
  return value ? JSON.parse(value) : null;
};

// ✅ PIN o'rnatilganmi?
export const isPinSet = async () => {
  const { value } = await Preferences.get({ key: 'pinSet' });
  return value === 'true';
};

// ✅ PIN o'rnatish (faqat birinchi kirganda)
export const savePin = async (pin) => {
  await Preferences.set({ key: 'pin', value: pin });
  await Preferences.set({ key: 'pinSet', value: 'true' });
};

// ✅ PIN tekshirish
export const checkPin = async (pin) => {
  const { value } = await Preferences.get({ key: 'pin' });
  return value === pin;
};
import type { FormValidateInput } from "@mantine/form";

export interface BookingFormValues {
  guestName: string;
  guestEmail: string;
}

export const bookingValidation: FormValidateInput<BookingFormValues> = {
  guestName: (value) =>
    value.trim().length === 0 ? "Имя обязательно" : null,
  guestEmail: (value) => {
    if (value.trim().length === 0) return "Email обязателен";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      return "Некорректный email";
    return null;
  },
};

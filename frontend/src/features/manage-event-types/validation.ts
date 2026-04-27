import type { FormValidateInput } from "@mantine/form";

export interface EventTypeFormValues {
  name: string;
  description: string;
  duration: number;
}

export const eventTypeValidation: FormValidateInput<EventTypeFormValues> = {
  name: (value) => {
    if (value.trim().length === 0) return "Название обязательно";
    if (value.length > 100) return "Максимум 100 символов";
    return null;
  },
  description: (value) => {
    if (value.trim().length === 0) return "Описание обязательно";
    if (value.length > 500) return "Максимум 500 символов";
    return null;
  },
  duration: (value) => {
    if (!value || value < 5) return "Минимум 5 минут";
    if (value > 480) return "Максимум 480 минут";
    return null;
  },
};

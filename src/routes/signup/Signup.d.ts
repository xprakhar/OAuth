import { useForm } from '@tanstack/react-form';

export interface SignupData {
  email: string;
  newletters: boolean;
  birthdate: { day: string; month: string; year: string };
  password: string;
  confirmPassword: string;
  termsOfService: boolean;
}

export interface PanelProps {
  form: ReturnType<typeof useForm<SignupData>>;
  onChange?: (() => void) | undefined;
}

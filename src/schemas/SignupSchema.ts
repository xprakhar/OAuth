import { z } from 'zod';

const daySchema = z
  .string()
  .regex(/^\d+$/, { message: 'Day must be a number' })
  .transform(Number)
  .refine((day) => day >= 1 && day <= 31, {
    message: 'Day must be between 1 and 31',
  });

const monthSchema = z
  .string()
  .regex(/^\d+$/, { message: 'Month must be a number' })
  .transform(Number)
  .refine((month) => month >= 1 && month <= 12, {
    message: 'Month must be between 1 and 12',
  });

const yearSchema = z
  .string()
  .regex(/^\d+$/, { message: 'Year must be a number' })
  .transform(Number)
  .refine((year) => year >= 1910 && year <= 2100, {
    message: 'Year must be between 1910 and 2100',
  });

const birthdateSchema = z
  .object({
    day: daySchema,
    month: monthSchema,
    year: yearSchema,
  })
  .superRefine(({ day, month, year }, ctx) => {
    const now = new Date();
    const inputDate = new Date(year, month - 1, day);

    // Check if the constructed date matches the input values
    if (
      inputDate.getDate() !== day ||
      inputDate.getMonth() + 1 !== month ||
      inputDate.getFullYear() !== year ||
      inputDate > now
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.invalid_date,
        message: 'Invalid Date',
        path: ['birthdate'],
        fatal: true,
      });

      return z.NEVER;
    }

    // Calculate age
    let age = now.getFullYear() - inputDate.getFullYear();

    // Adjust age if current date is before the birth date in the current year
    if (
      now.getMonth() < inputDate.getMonth() ||
      (now.getMonth() === inputDate.getMonth() &&
        now.getDate() < inputDate.getDate())
    ) {
      age -= 1;
    }

    if (age < 18) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Age must be 18 years or older',
        path: ['birthdate'],
        fatal: true,
      });

      return z.NEVER;
    }
  });

const schema = z
  .object({
    email: z.string().email(),
    newsletters: z.boolean(),
    birthdate: birthdateSchema.transform(({ day, month, year }) => {
      return new Date(year, month - 1, day);
    }),
    password: z
      .string()
      .min(8, { message: 'Password must be minimum 8 letters long' })
      .max(32, { message: 'Password must be maximum 32 letters long' }),
    confirmPassword: z.string(),
    termsOfService: z.literal(true, {
      message: 'Must accept terms of service',
    }),
  })
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Passwords must match',
        fatal: true,
        path: ['confirmPassword'],
      });

      return z.NEVER;
    }
  });

export const signupSchema = schema;

export { daySchema, monthSchema, yearSchema, birthdateSchema };

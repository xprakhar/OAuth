import { z } from 'zod';
import { useForm } from '@tanstack/react-form';
import { zodValidator } from '@tanstack/zod-form-adapter';
import InputBasic from '../../components/form/InputBasic';
import InputPassword from '../../components/form/InputPassword';

export function LoginForm() {
  const form = useForm({
    defaultValues: {
      username: '',
      password: '',
    },
    validatorAdapter: zodValidator(),
    onSubmit: async ({ value }) => {
      console.log(value);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className='flex max-w-96 flex-col gap-3 px-4 py-2'
    >
      {/* Username field */}
      <form.Field
        name='username'
        validators={{
          onChange: z.string().email('Please enter a valid email address'),
        }}
      >
        {(field) => (
          <InputBasic
            field={field}
            label='Email'
            type='email'
            autoComplete='home email'
          />
        )}
      </form.Field>

      {/* Password Field */}
      <form.Field
        name='password'
        validators={{
          onChange: z.string().min(1, { message: 'Password is required' }),
        }}
      >
        {(field) => (
          <InputPassword
            field={field}
            label='Password'
            autoComplete='current-password'
          />
        )}
      </form.Field>
      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting]}
      >
        {([canSubmit, isSubmitting]) => (
          <button
            type='submit'
            disabled={!canSubmit}
            className='bg-red-600 px-4 py-3 font-semibold text-neutral-50'
          >
            {isSubmitting ? 'Logging in...' : 'Log In'}
          </button>
        )}
      </form.Subscribe>
    </form>
  );
}

export default LoginForm;

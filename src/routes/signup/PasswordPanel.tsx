import { TabPanel } from '@headlessui/react';
import { z } from 'zod';
import { zodValidator } from '@tanstack/zod-form-adapter';
import { CircleCheckBig } from 'lucide-react';
import InputPassword from '../../components/form/InputPassword';
import NextBtnLarge from '../../components/buttons/NextBtnLarge';
import { PanelProps } from './Signup';

const schema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(32, 'Password must be shorter than 32 characters')
  .refine(
    password => {
      // Check for at least two categories: number, letter, symbol
      const hasNumber = /\d/.test(password);
      const hasLetter = /[a-zA-Z]/.test(password);
      const hasSymbol = /[^a-zA-Z0-9]/.test(password);
      const categories = [hasNumber, hasLetter, hasSymbol].filter(Boolean);

      return categories.length >= 2;
    },
    {
      message:
        'Password must contain at least two of the following: a number, a letter, a symbol',
    },
  );

function PasswordPanel({ form, onChange }: PanelProps) {
  const password = form.useStore(store => store.values.password);

  const is8Long = z.string().min(8).safeParse(password).success;
  const isDiverse = z
    .string()
    .refine(value => {
      // Check for at least two categories: number, letter, symbol
      const hasNumber = /\d/.test(value);
      const hasLetter = /[a-zA-Z]/.test(value);
      const hasSymbol = /[^a-zA-Z0-9]/.test(value);
      const categories = [hasNumber, hasLetter, hasSymbol].filter(Boolean);

      return categories.length >= 2;
    })
    .safeParse(password).success;

  return (
    <TabPanel className='flex flex-1 flex-col gap-3'>
      <div className='flex flex-col gap-2 text-center'>
        <h5 className='text-2xl font-semibold'>Choose a password</h5>
        <h6 className='text-lg text-neutral-700'>
          Never share it with someone else
        </h6>
      </div>
      {/* Input Fields And Button Container */}
      <div className='flex flex-1 flex-col justify-between gap-20'>
        {/* Password and Confirm Password Container */}
        <div className='flex flex-col gap-3'>
          {/* Password Input Field */}
          <form.Field
            name='password'
            validatorAdapter={zodValidator()}
            validators={{
              onChange: schema,
            }}>
            {field => (
              <InputPassword
                field={field}
                label='Password'
                autoComplete='new-password'
              />
            )}
          </form.Field>

          {/*  */}
          <div className='text-balance text-sm'>
            <ul className='space-y-2 *:flex *:gap-2'>
              <li>
                <CircleCheckBig
                  size={20}
                  className={`flex-shrink-0 ${is8Long && 'text-green-600'}`}
                />
                <span>Password must be at least 8 characters long</span>
              </li>
              <li>
                <CircleCheckBig
                  size={20}
                  className={`flex-shrink-0 ${isDiverse && 'text-green-600'}`}
                />
                <span>
                  Password must contain at least two of the following: a number,
                  a letter, a symbol
                </span>
              </li>
              <li>
                <CircleCheckBig
                  size={20}
                  className={`flex-shrink-0 ${is8Long && isDiverse && 'text-green-600'}`}
                />
                <span>Password must be at least fair or good strength</span>
              </li>
            </ul>
          </div>

          {/* Confirm Password Input Field */}
          <form.Field
            name='confirmPassword'
            validatorAdapter={zodValidator()}
            validators={{
              onChange: z.string().refine(
                value => {
                  const password = form.getFieldValue('password');
                  return value === password;
                },
                { message: 'Passwords do not match' },
              ),
              onChangeListenTo: ['password'],
            }}>
            {field => <InputPassword field={field} label='Confirm Password' />}
          </form.Field>

          {/* Field And Checkbox Conatiner End */}
        </div>

        {/* Next Button */}
        <form.Subscribe
          selector={({ values }) => [values.password, values.confirmPassword]}>
          {([password, confirmPassword]) => {
            const isValid =
              schema.safeParse(password).success &&
              password === confirmPassword;

            return (
              <NextBtnLarge
                type='submit'
                isDisabled={!isValid}
                onClick={onChange}
              />
            );
          }}
        </form.Subscribe>
      </div>
    </TabPanel>
  );
}

export default PasswordPanel;

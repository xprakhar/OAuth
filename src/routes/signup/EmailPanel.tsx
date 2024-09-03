import { z } from 'zod';
import { TabPanel } from '@headlessui/react';
import { zodValidator } from '@tanstack/zod-form-adapter';
import NextBtnLarge from '../../components/buttons/NextBtnLarge';
import InputBasic from '../../components/form/InputBasic';
import CheckBox from '../../components/form/CheckBox';
import { PanelProps } from './Signup';

function EmailPanel({ form, onChange }: PanelProps) {
  return (
    <TabPanel className='flex flex-1 flex-col gap-3'>
      <div className='flex flex-col gap-2 text-center'>
        <h5 className='text-2xl font-semibold'>Enter your email address</h5>
        <h6 className='text-lg text-neutral-700'>This will be your username</h6>
      </div>
      {/* Form And Button Container */}
      <div className='flex flex-1 flex-col justify-between gap-20'>
        {/* Input Field And CheckBox Container */}
        <div className='flex flex-col gap-3'>
          {/* Email Address Field */}
          <form.Field
            name='email'
            validatorAdapter={zodValidator()}
            validators={{
              onChange: z.string().email('Please enter a valid email address'),
            }}>
            {field => (
              <InputBasic
                type='email'
                label='Email'
                autoComplete='home email'
                field={field}
              />
            )}
          </form.Field>

          {/* NewsLetter Checkbox */}
          <form.Field
            name='newletters'
            validatorAdapter={zodValidator()}
            validators={{ onChange: z.boolean() }}>
            {field => (
              <CheckBox
                field={field}
                label='Yes; Recieve newsletters, updates and promotions about our
                  latest products.'
              />
            )}
          </form.Field>
          {/* Field And Checkbox Conatiner End */}
        </div>

        {/* Next Button */}
        <form.Subscribe selector={state => state.values.email}>
          {email => {
            const isValid = z.string().email().safeParse(email).success;

            return (
              <NextBtnLarge
                type='button'
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

export default EmailPanel;

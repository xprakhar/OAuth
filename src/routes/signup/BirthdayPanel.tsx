import { zodValidator } from '@tanstack/zod-form-adapter';
import { TabPanel } from '@headlessui/react';
import {
  daySchema,
  monthSchema,
  yearSchema,
  birthdateSchema,
} from '../../schemas/SignupSchema';
import NextBtnLarge from '../../components/buttons/NextBtnLarge';
import InputNested from '../../components/form/InputNested';
import { PanelProps } from './Signup';

export default function BirthdayPanel({ form, onChange }: PanelProps) {
  return (
    <TabPanel className='flex flex-1 flex-col gap-3'>
      <div className='flex flex-col gap-2 text-center'>
        <h5 className='text-2xl font-semibold'>When were you born?</h5>
        <h6 className='text-lg text-neutral-700'>
          Let&apos;s find out how old you are.
        </h6>
      </div>

      {/* Form And Button Container */}
      <div className='flex flex-1 flex-col justify-between gap-20'>
        {/* Input Field And CheckBox Container */}
        <div className='flex flex-col gap-3'>
          {/* BirthDay Field */}
          <form.Field
            name='birthdate'
            validatorAdapter={zodValidator()}
            validators={{ onBlur: birthdateSchema }}>
            {({ state, handleBlur, handleChange }) => {
              const { day: dd, month: mm, year: yy } = state.value;

              const invalid = state.meta.errors.length > 0;

              return (
                <div
                  className={`group relative flex w-full border focus-within:ring-1 ${invalid ? 'border-rose-500 focus-within:ring-rose-400' : 'border-neutral-500 focus-within:border-sky-500 focus-within:ring-sky-400'}`}>
                  <form.Field
                    name='birthdate.day'
                    validatorAdapter={zodValidator()}
                    validators={{
                      onBlur: daySchema,
                    }}>
                    {day => (
                      <InputNested
                        field={day}
                        label='Day'
                        placeholder='DD'
                        handleParentBlur={handleBlur}
                        handleParentChange={e =>
                          handleChange({
                            ...state.value,
                            day: e.target.value,
                          })
                        }
                      />
                    )}
                  </form.Field>

                  <form.Field
                    name='birthdate.month'
                    validatorAdapter={zodValidator()}
                    validators={{
                      onBlur: monthSchema,
                    }}>
                    {month => (
                      <InputNested
                        field={month}
                        label='Month'
                        placeholder='MM'
                        handleParentBlur={handleBlur}
                        handleParentChange={e =>
                          handleChange({
                            ...state.value,
                            month: e.target.value,
                          })
                        }
                      />
                    )}
                  </form.Field>

                  <form.Field
                    name='birthdate.year'
                    validatorAdapter={zodValidator()}
                    validators={{
                      onBlur: yearSchema,
                    }}>
                    {year => (
                      <InputNested
                        field={year}
                        label='Year'
                        placeholder='YYYY'
                        handleParentBlur={handleBlur}
                        handleParentChange={e =>
                          handleChange({
                            ...state.value,
                            year: e.target.value,
                          })
                        }
                      />
                    )}
                  </form.Field>
                  <span
                    className={`pointer-events-none visible absolute px-4 text-neutral-500 group-focus-within:invisible ${dd || mm || yy ? 'top-0 translate-y-0 text-sm' : 'top-1/2 -translate-y-1/2 text-base'}`}>
                    Birthdate
                  </span>
                </div>
              );
            }}
          </form.Field>
        </div>
        {/* Next Button */}
        <form.Subscribe selector={state => state.values.birthdate}>
          {birthdate => {
            const isDisabled = !birthdateSchema.safeParse(birthdate).success;
            return (
              <NextBtnLarge
                type='button'
                isDisabled={isDisabled}
                onClick={onChange}
              />
            );
          }}
        </form.Subscribe>
      </div>
    </TabPanel>
  );
}

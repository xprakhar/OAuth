import { MouseEventHandler, useState } from 'react';
import { Field, Input, Label } from '@headlessui/react';
import { Eye, EyeOff } from 'lucide-react';

import {
  DeepKeys,
  DeepValue,
  FieldApi,
  Updater,
  Validator,
} from '@tanstack/react-form';

export interface PasswordFieldProps<
  TParentData,
  TName extends DeepKeys<TParentData>,
  TFieldValidator extends
    | Validator<DeepValue<TParentData, TName>, unknown>
    | undefined = undefined,
  TFormValidator extends
    | Validator<TParentData, unknown>
    | undefined = undefined,
  TData extends DeepValue<TParentData, TName> = DeepValue<TParentData, TName>,
> {
  label: string;
  field: FieldApi<TParentData, TName, TFieldValidator, TFormValidator, TData>;
  autoComplete?: string;
}

function InputPassword<
  TParentData,
  TName extends DeepKeys<TParentData>,
  TFieldValidator extends
    | Validator<DeepValue<TParentData, TName>, unknown>
    | undefined = undefined,
  TFormValidator extends
    | Validator<TParentData, unknown>
    | undefined = undefined,
  TData extends DeepValue<TParentData, TName> = DeepValue<TParentData, TName>,
>({
  label,
  field,
  autoComplete,
}: PasswordFieldProps<
  TParentData,
  TName,
  TFieldValidator,
  TFormValidator,
  TData
>) {
  const [shown, setShown] = useState<boolean>(false);

  const handleToggle: MouseEventHandler<SVGElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShown((prev) => !prev);
  };

  return (
    <Field className='relative'>
      <Input
        type={shown ? 'text' : 'password'}
        name={field.name as string}
        id={field.name as string}
        value={field.state.value as string}
        onChange={(e) => field.handleChange(e.target.value as Updater<TData>)}
        onBlur={field.handleBlur}
        invalid={field.state.meta.errors.length > 0}
        className='form-input peer w-full border border-neutral-400 px-4 pb-1 pt-5 placeholder:text-transparent placeholder-shown:py-3 data-[focus]:border-sky-500 data-[invalid]:border-rose-500 data-[focus]:ring-1 data-[focus]:ring-sky-400 data-[invalid]:ring-rose-400'
        autoComplete={autoComplete || 'off'}
        placeholder={label}
      />
      <Label className='pointer-events-none absolute left-0 top-1 translate-y-0 px-4 text-sm text-neutral-700 transition-all duration-100 ease-in-out peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base'>
        {label}
      </Label>

      {shown ? (
        <Eye
          className='absolute right-4 top-1/2 z-50 -translate-y-1/2'
          onClick={handleToggle}
        />
      ) : (
        <EyeOff
          className='absolute right-4 top-1/2 z-50 -translate-y-1/2'
          onClick={handleToggle}
        />
      )}
    </Field>
  );
}

export default InputPassword;

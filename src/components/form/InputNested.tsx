import { Field, Input, Label } from '@headlessui/react';
import {
  DeepKeys,
  DeepValue,
  FieldApi,
  Updater,
  Validator,
} from '@tanstack/react-form';

export interface NestedFieldProps<
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
  placeholder: string;
  field: FieldApi<TParentData, TName, TFieldValidator, TFormValidator, TData>;
  handleParentChange?: React.ChangeEventHandler<HTMLInputElement> | undefined;
  handleParentBlur?: React.FocusEventHandler<HTMLInputElement> | undefined;
}

function InputNested<
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
  placeholder,
  field,
  handleParentChange,
  handleParentBlur,
}: NestedFieldProps<
  TParentData,
  TName,
  TFieldValidator,
  TFormValidator,
  TData
>) {
  return (
    <Field className='relative w-14 overflow-visible group-focus-within:flex-1'>
      <Input
        type='text'
        autoComplete='off'
        placeholder={placeholder}
        name={field.name as string}
        id={field.name as string}
        value={field.state.value as string}
        onChange={(e) => {
          field.handleChange(e.target.value as Updater<TData>);
          if (handleParentChange) handleParentChange(e);
        }}
        onBlur={(e) => {
          field.handleBlur();
          if (handleParentBlur) handleParentBlur(e);
        }}
        className='peer block w-full appearance-none overflow-visible border-0 pb-1 pl-4 pt-5 placeholder:text-transparent placeholder-shown:py-3 focus:pb-1 focus:pt-6 focus:outline-none focus:ring-0 focus:placeholder:text-neutral-400'
      />
      <Label className='pointer-events-none absolute top-0 translate-y-0 px-4 text-sm text-neutral-500 text-transparent transition-all duration-100 ease-in-out group-focus-within:text-neutral-500 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base peer-focus:top-0 peer-focus:translate-y-0 peer-focus:text-sm'>
        {label}
      </Label>
    </Field>
  );
}

export default InputNested;

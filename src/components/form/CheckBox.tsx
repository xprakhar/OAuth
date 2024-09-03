import { Field, Checkbox, Label } from '@headlessui/react';

import {
  DeepKeys,
  DeepValue,
  FieldApi,
  Updater,
  Validator,
} from '@tanstack/react-form';
import { Check } from 'lucide-react';

export interface CheckBoxProps<
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
}

function CheckBox<
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
}: CheckBoxProps<TParentData, TName, TFieldValidator, TFormValidator, TData>) {
  return (
    <Field className='flex items-center gap-4'>
      <Checkbox
        id={field.name as string}
        name={field.name as string}
        checked={field.state.value as boolean}
        onChange={(e) => field.handleChange(e as Updater<TData>)}
        className='form-checkbox group inline-flex size-8 items-center justify-center rounded-md bg-transparent data-[checked]:bg-red-500'
      >
        <Check
          size={24}
          strokeWidth={2}
          className='invisible text-white group-data-[checked]:visible'
        />
      </Checkbox>
      <Label>{label}</Label>
    </Field>
  );
}

export default CheckBox;

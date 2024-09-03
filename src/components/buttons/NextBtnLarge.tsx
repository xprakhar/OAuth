import { Button } from '@headlessui/react';
import { ArrowRight } from 'lucide-react';

export interface ButtonProps {
  type: 'button' | 'submit' | 'reset';
  isDisabled?: boolean | undefined;
  onClick?: React.MouseEventHandler<HTMLButtonElement> | undefined;
}

export function NextBtnLarge({ type, isDisabled, onClick }: ButtonProps) {
  return (
    <Button
      className='group self-center rounded-2xl border border-red-600 bg-red-600 p-5 data-[disabled]:border-gray-200 data-[disabled]:bg-white'
      disabled={isDisabled}
      onClick={onClick}
      type={type}
    >
      <ArrowRight
        size={46}
        className='text-white group-data-[disabled]:text-gray-200'
      />
    </Button>
  );
}

export default NextBtnLarge;

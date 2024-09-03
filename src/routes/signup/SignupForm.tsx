import { useState } from 'react';
import { Form } from 'react-router-dom';
import { Tab, TabGroup, TabList, TabPanels } from '@headlessui/react';
import { useForm } from '@tanstack/react-form';
import { Minus } from 'lucide-react';
import EmailPanel from './EmailPanel';
import PasswordPanel from './PasswordPanel';
import TermsOfService from './TermsOfServicePanel';
import BirthdayPanel from './BirthdayPanel';
import { SignupData } from './Signup';

function SignupForm() {
  const form = useForm<SignupData>({
    defaultValues: {
      email: '',
      newletters: true,
      birthdate: { day: '', month: '', year: '' },
      password: '',
      confirmPassword: '',
      termsOfService: false,
    },
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [tabDisabledList, setTabDisabledList] = useState([
    false,
    true,
    true,
    true,
  ]);
  const [maxReachedIndex, setMaxReachedIndex] = useState(0);

  const handleEnable = (index: number) => {
    setTabDisabledList((prev) => {
      const newDisabledList = [...prev];
      newDisabledList[index] = false;
      return newDisabledList;
    });
  };

  const handleTabChange = (index: number) => {
    if (!tabDisabledList[index]) {
      setSelectedIndex(index);
      if (index > maxReachedIndex) {
        setMaxReachedIndex(index);
      } else if (index < selectedIndex) {
        setTabDisabledList((prev) => [...prev].fill(true, index + 1));
      }
    }
  };

  const handleNext = () => {
    // Add check to prevent enabling out-of-bound index
    if (selectedIndex < tabDisabledList.length - 1) {
      handleEnable(selectedIndex + 1);
      setSelectedIndex((prev) => prev + 1);
    }
  };

  return (
    <Form
      method='POST'
      className='flex h-[600px] max-w-96 flex-col gap-3 border border-neutral-200 px-4 py-2'
    >
      <TabGroup
        className='flex flex-1 flex-col gap-3'
        selectedIndex={selectedIndex}
        onChange={handleTabChange}
      >
        <TabList className='text-center'>
          {Array.from(Array(4).keys()).map((index) => (
            <Tab key={index} disabled={tabDisabledList[index]}>
              <Minus />
            </Tab>
          ))}
        </TabList>
        <TabPanels className='flex flex-1 flex-col gap-3'>
          <EmailPanel form={form} onChange={handleNext} />
          <BirthdayPanel form={form} onChange={handleNext} />
          <PasswordPanel form={form} onChange={handleNext} />
          <TermsOfService form={form} />
        </TabPanels>
      </TabGroup>
    </Form>
  );
}

export default SignupForm;

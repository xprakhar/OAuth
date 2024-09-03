import { Checkbox, Field, Label, TabPanel } from '@headlessui/react';
import { z } from 'zod';
import { zodValidator } from '@tanstack/zod-form-adapter';
import { Check } from 'lucide-react';
import NextBtnLarge from '../../components/buttons/NextBtnLarge';
import { PanelProps } from './Signup';

function TermsOfService({ form }: PanelProps) {
  return (
    <TabPanel className='flex flex-1 flex-col gap-3'>
      <div className='flex flex-col gap-2 text-center'>
        <h5 className='text-2xl font-semibold'>Terms of Service</h5>
        <h6 className='text-lg text-neutral-700'>
          Please scroll down and accept o use our services
        </h6>
      </div>
      {/* Form And Button Container */}
      <div className='flex flex-1 flex-col justify-between gap-5'>
        {/* Document And CheckBox Container */}
        <div className='h-72 overflow-scroll px-2'>
          <p>
            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Cum est
            qui, dolor repellat excepturi recusandae, nihil quis dignissimos
            iusto provident porro placeat necessitatibus magni libero! Modi
            perferendis quis eum repudiandae! Earum, quia maiores iusto magnam
            saepe quo iste perferendis assumenda nisi, excepturi quae obcaecati
            consequuntur tempore voluptatibus. Accusamus tempora enim minus
            rerum minima nam illo consequuntur, similique amet earum?
            Voluptates. Minima sint fugit tempore harum minus eos architecto
            numquam placeat qui perferendis delectus asperiores officia
            consequuntur autem, pariatur molestias doloribus, quo quasi rem
            repudiandae! Voluptatem aut officia accusamus fuga autem.
            Consequatur veritatis cumque a, velit adipisci sint. Perferendis at
            error ipsa ad mollitia, iusto obcaecati dignissimos dolores. Ipsam
            fugiat suscipit placeat quibusdam cum est explicabo alias modi!
            Eveniet, placeat neque! Dolorem ad fugit dicta totam ullam magnam,
            ex quam voluptate necessitatibus nisi nesciunt quasi praesentium
            sint, perferendis eius quidem exercitationem aliquam natus in unde
            enim minus. Perspiciatis sequi nostrum aliquid. Distinctio ipsam,
            error nostrum natus facilis tenetur, praesentium ratione nobis
            excepturi fuga perspiciatis iure sunt possimus, soluta aut dolore
            maiores tempore similique dicta quis in labore ex velit. Eum,
            exercitationem? Ipsum illo amet tenetur perferendis labore impedit
            aspernatur iusto, eaque odit veritatis iure? Minus, facere. Placeat
            minima nemo hic dolorem deserunt. Inventore consectetur ipsa fuga
            quos tenetur eos quisquam quae. Ratione excepturi repudiandae
            provident. Quidem velit minima ea ipsum nostrum, voluptatibus nisi
            vitae sed consectetur distinctio incidunt cumque ex sit officia
            minus. Distinctio cupiditate illo tempora harum, et asperiores
            animi? Velit iusto perferendis nemo consequatur officia alias. Eaque
            quisquam delectus qui molestiae pariatur doloribus, sequi assumenda?
          </p>
          {/* Terms of Service Checkbox */}
          <form.Field
            name='termsOfService'
            validatorAdapter={zodValidator()}
            validators={{ onChange: z.literal(true) }}>
            {field => (
              <Field className='flex items-center gap-4'>
                <Checkbox
                  name={field.name}
                  id={field.name}
                  checked={field.state.value}
                  onChange={e => field.handleChange(e)}
                  className='form-checkbox group inline-flex size-8 items-center justify-center rounded-md bg-transparent data-[checked]:bg-red-500'>
                  <Check
                    size={24}
                    strokeWidth={2}
                    className='invisible text-white group-data-[checked]:visible'
                  />
                </Checkbox>
                <Label className='text-wrap'>
                  Yes; Recieve newsletters, updates and promotions about our
                  latest products.
                </Label>
              </Field>
            )}
          </form.Field>
        </div>

        {/* Next Button */}
        <form.Subscribe selector={state => state.values.termsOfService}>
          {termsOfService => {
            const isValid = z.literal(true).safeParse(termsOfService).success;

            return <NextBtnLarge type='submit' isDisabled={!isValid} />;
          }}
        </form.Subscribe>
      </div>
    </TabPanel>
  );
}

export default TermsOfService;

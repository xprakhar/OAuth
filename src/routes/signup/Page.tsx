import { ActionFunction, ActionFunctionArgs, redirect } from 'react-router-dom';
import SignupForm from './SignupForm';

export const action: ActionFunction = async ({
  request,
  params,
}: ActionFunctionArgs) => {
  console.log(request);
  return redirect('/');
};

export const Route = () => {
  return (
    <>
      <main>
        <SignupForm />
      </main>
      <footer>&copy; 2024 Monkey from Killerz</footer>
    </>
  );
};

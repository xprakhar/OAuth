import { RouteObject } from 'react-router-dom';
import { Route as LoginRoute } from './routes/login/Page';
import {
  Route as SignupRoute,
  action as SignupAction,
} from './routes/signup/Page';
import App from './routes/App';

export const routes: RouteObject[] = [
  {
    path: '/',
    Component: App,
    children: [
      {
        index: true,
        Component: LoginRoute,
      },
      {
        path: '/signup',
        Component: SignupRoute,
        action: SignupAction,
      },
    ],
  },
];

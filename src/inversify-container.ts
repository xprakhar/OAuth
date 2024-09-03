import { Container } from 'inversify';
import { TYPES } from './inversify-types';
import { MongoConnection } from './utils/mongo-connection';
import { IUserService, UserService } from './services/UserService';
import { IKeyService, KeyService } from './services/KeyService';
import { TokenService, ITokenService } from './services/TokenService';
import './controllers/Home';

const container = new Container();

container.bind<MongoConnection>(TYPES.MongoConnection).to(MongoConnection);
container.bind<IUserService>(TYPES.UserService).to(UserService);
container.bind<IKeyService>(TYPES.KeyService).to(KeyService);
container.bind<ITokenService>(TYPES.TokenService).to(TokenService);

export { container };

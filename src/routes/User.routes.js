import { Router } from 'express';

// local imports
import { Validater } from '../helper/Validator.js';
import { RegistrationValidation } from '../Validation/user.validation.js';
import { ChangePassword, CreateUser, LogedInUser, LoginUser } from '../controller/User.controller.js';
import { Autherization } from '../middleware/Authentication.js';

const routes = Router();

routes.route('/register').post(Validater(RegistrationValidation), CreateUser);
routes.route('/login').post(LoginUser);
routes.route('/loged-in-user').get(Autherization, LogedInUser);
routes.route('/change-password').post(Autherization, ChangePassword);

export default routes;

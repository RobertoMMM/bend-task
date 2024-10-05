import { RequestHandler, Response, Router } from 'express';
import { Sequelize } from 'sequelize';
import { CreateUserData, LoginUserData } from '../types';
import { User } from '../models/users';
import { generateToken } from '../middleware/auth';
import { usersResponses } from '../config/responseMessages';
import { BinaryLike, createHash, randomBytes } from 'crypto';
import { HASH_ALGORITHM, SALT_LENGTH } from '../config';

const handleResponse = (res: Response, status: any) => {
  const { code, message, errors, token } = status;
  if (token) {
    return res.status(code).json({ message, token, errors });
  }
  return res.status(code).json({ message, errors });
};

const hashPassword = (password: BinaryLike) => {
  return createHash(HASH_ALGORITHM).update(password).digest('hex');
};

const saltPassword = (password: BinaryLike) => {
  const salt: BinaryLike = randomBytes(SALT_LENGTH).toString('hex');

  const hashedPassword = hashPassword(`${salt}${password}`);

  return `${salt}:${hashedPassword}`;
};

const signupUser = async (
  data: CreateUserData,
  sequelizeClient: Sequelize
): Promise<any> => {
  const { name, email, password: passwordHash } = data;
  const { models } = sequelizeClient;

  try {
    const saltedPassword = saltPassword(passwordHash);

    await models.User.create({
      type: 'blogger',
      name,
      email,
      passwordHash: saltedPassword,
    });

    return {
      ...usersResponses.success.userCreated,
      errors: [],
    };
  } catch (err: any) {
    return {
      ...usersResponses.errors.invalidCredentials,
      errors: err.errors?.map((error: any) => error.message),
    };
  }
};

const initSignupUserHandler = (sequelizeClient: Sequelize): RequestHandler => {
  return async function signupUserHandler(req, res, next): Promise<any> {
    try {
      const { name, email, password } = req.body as CreateUserData;
      const status = await signupUser(
        { name, email, password },
        sequelizeClient
      );
      return handleResponse(res, status);
    } catch (error) {
      next(error);
    }
  };
};

const loginUser = async (
  data: LoginUserData,
  sequelizeClient: Sequelize
): Promise<any> => {
  const { email, password } = data;
  const { models } = sequelizeClient;

  try {
    const searchedUser = (await models.User.findOne({
      where: { email },
    })) as User;

    if (!searchedUser) {
      return usersResponses.errors.invalidCredentials;
    }

    const [salt, hash] = searchedUser.passwordHash.split(':');
    const passwordHash = hashPassword(`${salt}${password}`);

    if (searchedUser && hash === passwordHash) {
      return {
        ...usersResponses.success.login,
        token: generateToken({
          isAdmin: false,
          name: searchedUser.name,
          id: searchedUser.id,
        }),
        errors: [],
      };
    }

    return usersResponses.errors.invalidCredentials;
  } catch (err: any) {
    return {
      ...usersResponses.errors.invalidCredentials,
      errors: err.errors?.map((error: any) => error.message),
    };
  }
};

const initLoginUserHandler = (sequelizeClient: Sequelize): RequestHandler => {
  return async function loginUserHandler(req, res, next): Promise<any> {
    try {
      const { email, password } = req.body as LoginUserData;
      const status = await loginUser({ email, password }, sequelizeClient);
      return handleResponse(res, status);
    } catch (error) {
      next(error);
    }
  };
};

export const initAuthRouter = (sequelizeClient: Sequelize): Router => {
  const router = Router({ mergeParams: true });

  router.route('/signup').post(initSignupUserHandler(sequelizeClient));
  router.route('/signin').post(initLoginUserHandler(sequelizeClient));

  return router;
};

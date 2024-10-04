import { RequestHandler } from 'express';
import { Sequelize } from 'sequelize';
import { RequestAuth, TokenData } from '../types';
import jwt, { PrivateKey, PublicKey, Secret } from 'jsonwebtoken';
import dotenv from 'dotenv';
import { usersResponses } from '../config/responseMessages';

dotenv.config();

export const generateToken = (data: TokenData): string => {
  return jwt.sign(
    {
      sub: data.id,
      name: data.name,
      admin: data.isAdmin,
    },
    process.env.JWT_SECRET as Secret | PrivateKey
  );
};

export const decodeToken = (token: string): TokenData | void => {
  return jwt.verify(
    token,
    process.env.JWT_SECRET as Secret | PublicKey,
    {},
    (err, decoded) => {
      if (err) {
        return;
      } else {
        return decoded;
      }
    }
  );
};

export const initTokenValidationHandler = (
  sequelizeClient: Sequelize
): RequestHandler => {
  return async function tokenValidationRequestHandler(
    req,
    res,
    next
  ): Promise<any> {
    try {
      const { models } = sequelizeClient;

      const authorizationHeaderValue = req.header('Authorization');
      if (!authorizationHeaderValue) {
        return res
          .status(usersResponses.errors.invalidToken.code)
          .json({ message: usersResponses.errors.invalidToken.message });
      }

      const [type, token] = authorizationHeaderValue.split(' ');
      if (type?.toLowerCase() !== 'bearer') {
        return res
          .status(usersResponses.errors.notBearer.code)
          .json({ message: usersResponses.errors.notBearer.message });
      }

      if (!token) {
        return res
          .status(usersResponses.errors.missingToken.code)
          .json({ message: usersResponses.errors.missingToken.message });
      }

      const payload = decodeToken(token);

      const user = await models.User.findByPk(payload?.sub);
      if (!user) {
        return res
          .status(usersResponses.errors.notFound.code)
          .json({ message: usersResponses.errors.notFound.message });
      }

      (req as any).auth = {
        token,
        user,
      } as RequestAuth;

      return next();
    } catch (error) {
      return next(error);
    }
  };
};

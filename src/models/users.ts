import { Sequelize, DataTypes, Model } from 'sequelize';
import { UserType } from '../types';
import { usersResponses } from '../config/responseMessages';

export class User extends Model {
  id!: number;
  type!: UserType;
  name!: string;
  email!: string;
  passwordHash!: string;
  createdAt!: Date;
  updatedAt!: Date;
}

export const setupUsersModel = (
  modelName: string,
  sequelize: Sequelize
): void => {
  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      type: {
        type: DataTypes.ENUM,
        values: Object.values(UserType),
        defaultValue: UserType.BLOGGER,
        allowNull: false,
        validate: {
          isIn: [Object.values(UserType)],
        },
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: usersResponses.dbValidation.name.unique,
        validate: {
          len: {
            args: [5, 50],
            msg: usersResponses.dbValidation.name.len,
          },
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: usersResponses.dbValidation.email.unique,
        validate: {
          isEmail: {
            msg: usersResponses.dbValidation.email.isEmail,
          },
        },
      },
      passwordHash: {
        type: DataTypes.STRING,
        field: 'password_hash',
        allowNull: false,
        validate: {
          len: {
            args: [97, 97],
            msg: usersResponses.dbValidation.passwordHash.len,
          },
        },
      },
      createdAt: {
        type: DataTypes.DATE,
        field: 'created_at',
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        field: 'updated_at',
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      tableName: 'users',
      modelName,
      name: {
        singular: 'user',
        plural: 'users',
      },
      timestamps: true,
    }
  );
};

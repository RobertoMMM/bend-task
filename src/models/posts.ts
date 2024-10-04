import { Sequelize, DataTypes, Model } from 'sequelize';
import { postsResponses } from '../config/responseMessages';

export class Post extends Model {
  id!: number;
  title!: string;
  content!: string;
  authorId!: number;
  createdAt!: Date;
  updatedAt!: Date;
}

export const setupPostsModel = (
  modelName: string,
  sequelize: Sequelize
): void => {
  Post.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [5, 100],
          msg: postsResponses.dbValidation.title.len,
        },
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          len: [5, 1000],
          msg: postsResponses.dbValidation.content.len,
        },
      },
      isHidden: {
        type: DataTypes.BOOLEAN,
        field: 'is_hidden',
        allowNull: false,
        defaultValue: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
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
      tableName: 'posts',
      modelName,
      name: {
        singular: 'post',
        plural: 'posts',
      },
      timestamps: true,
    }
  );
};

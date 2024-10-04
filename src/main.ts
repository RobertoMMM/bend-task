import dotenv from 'dotenv';
import cors from 'cors';
import express from 'express';

import config from './config';
import { initAuthRouter } from './routers/auth';
import { setupUsersModel, User } from './models/users';
import { Post, setupPostsModel } from './models/posts';
import { getSequelizeClient } from './sequelize';
import { initPostsRouter } from './routers/posts';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const startServer = async () => {
  const sequelizeClient = await getSequelizeClient(config.db);

  const queryInterface = sequelizeClient.getQueryInterface();

  const usersTableExists = await queryInterface.tableExists('users');
  const postsTableExists = await queryInterface.tableExists('posts');

  setupUsersModel('User', sequelizeClient);
  setupPostsModel('Post', sequelizeClient);

  if (!usersTableExists) {
    await User.sync({ force: true });
  }

  if (!postsTableExists) {
    await Post.sync({ force: true });
  }

  app.use('/auth', initAuthRouter(sequelizeClient));
  app.use('/posts', initPostsRouter(sequelizeClient));

  app.listen(config.port, () =>
    console.log(`Server listens on http://localhost:${config.port}`)
  );
};

startServer();

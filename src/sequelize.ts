import { Options, Sequelize } from 'sequelize';

export const getSequelizeClient = async (params: Options) => {
  const sequelizeClient = new Sequelize(params);

  await sequelizeClient.sync();

  return sequelizeClient;
};

import { RequestHandler, Router } from 'express';
import { Sequelize } from 'sequelize';
import {
  DeletePostData,
  GetPostData,
  PublishPostData,
  UpdatePostData,
  UserType,
} from '../types';
import { initTokenValidationHandler } from '../middleware/auth';
import { Post } from '../models/posts';
import pick from 'lodash.pick';
import { postsResponses } from '../config/responseMessages';

const createPost = async (
  data: PublishPostData,
  sequelizeClient: Sequelize
): Promise<any> => {
  const { content, isHidden, title, userId } = data;
  const { models } = sequelizeClient;

  const post = Post.build({ content, isHidden, title, userId });

  try {
    await post.validate({ fields: ['content', 'isHidden', 'title', 'userId'] });
    await models.Post.create({ content, isHidden, title, userId });

    return {
      ...postsResponses.success.postCreated,
      errors: [],
    };
  } catch (err: any) {
    return {
      ...postsResponses.errors.invalidFields,
      errors: err.errors?.map((error: any) => error.message),
    };
  }
};

const initCreatePostHandler = (sequelizeClient: Sequelize): RequestHandler => {
  return async function createPostHandler(req: any, res, next): Promise<any> {
    try {
      const user = req.auth?.user?.dataValues;
      const { content, isHidden, title } = req.body as PublishPostData;

      const status = await createPost(
        { content, isHidden, title, userId: user.id },
        sequelizeClient
      );

      return res
        .status(status.code)
        .json({ message: status.message, errors: status.errors });
    } catch (error) {
      next(error);
    }
  };
};

const deletePost = async (
  data: DeletePostData,
  sequelizeClient: Sequelize
): Promise<any> => {
  const { postId, userId } = data;
  const { models } = sequelizeClient;

  const post = Post.build({ id: postId, userId });

  try {
    await post.validate({ fields: ['userId', 'id'] });

    const searchedPost: any = await models.Post.findOne({
      where: { id: postId },
    });

    const searchedUser: any = await models.User.findOne({
      where: { id: userId },
    });

    if (
      searchedPost?.userId === userId ||
      (searchedUser.type === UserType.ADMIN && searchedPost.isHidden === false)
    ) {
      await models.Post.destroy({ where: { id: postId } });
      return postsResponses.success.postDeleted;
    }

    return postsResponses.errors.postNotFound;
  } catch (err: any) {
    return {
      ...postsResponses.errors.invalidFields,
      errors: err.errors?.map((error: any) => error.message),
    };
  }
};

const initDeletePostHandler = (sequelizeClient: Sequelize): RequestHandler => {
  return async function deletePostHandler(req: any, res, next): Promise<any> {
    try {
      const user = req.auth?.user?.dataValues;

      const status = await deletePost(
        { postId: Number(req.params.id), userId: user.id },
        sequelizeClient
      );

      return res
        .status(status.code)
        .json({ message: status.message, errors: status.errors });
    } catch (error) {
      next(error);
    }
  };
};

const updatePost = async (
  data: UpdatePostData & { postId: number; userId: number },
  sequelizeClient: Sequelize
): Promise<any> => {
  const { postId, userId, content, isHidden, title } = data;
  const { models } = sequelizeClient;

  const post = Post.build({ id: postId, userId, content, isHidden, title });

  try {
    const fieldsToUpdate = Object.keys({ content, isHidden, title }).filter(
      //@ts-ignore
      (field) => data[field] !== undefined
    );

    if (fieldsToUpdate.length === 0) return;

    await post.validate({
      fields: fieldsToUpdate,
    });

    const searchedPost: any = await models.Post.findOne({
      where: { id: postId },
    });

    if (searchedPost?.dataValues?.userId === userId) {
      const postToUpdate = await models.Post.findByPk(postId);
      postToUpdate?.update({
        ...searchedPost?.dataValues,
        ...pick(data, fieldsToUpdate),
        updatedAt: Date.now(),
      });

      return postsResponses.success.postUpdated;
    }

    return postsResponses.errors.postNotFound;
  } catch (err: any) {
    return {
      ...postsResponses.errors.invalidFields,
      errors: err.errors?.map((error: any) => error.message),
    };
  }
};

const initUpdatePostHandler = (sequelizeClient: Sequelize): RequestHandler => {
  return async function updatePostHandler(req: any, res, next): Promise<any> {
    try {
      const user = req.auth?.user?.dataValues;

      const { content, isHidden, title } = req.body as UpdatePostData;

      const status = await updatePost(
        {
          postId: Number(req.params.id),
          userId: user.id,
          content,
          isHidden,
          title,
        },
        sequelizeClient
      );

      return res
        .status(status.code)
        .json({ message: status.message, errors: status.errors });
    } catch (error) {
      next(error);
    }
  };
};

const getPost = async (
  data: GetPostData,
  sequelizeClient: Sequelize
): Promise<any> => {
  const { postId, userId } = data;
  const { models } = sequelizeClient;

  try {
    const searchedPost: any = await models.Post.findOne({
      where: { id: postId },
    });

    const data = {
      title: searchedPost.title,
      content: searchedPost.content,
      id: searchedPost.id,
      isHidden: searchedPost.isHidden,
      userId: searchedPost.userId,
    };

    if (searchedPost.isHidden && searchedPost?.userId === userId) {
      return {
        data,
        ...postsResponses.success.postRetrieving,
      };
    } else if (!searchedPost.isHidden) {
      return {
        data,
        ...postsResponses.success.postRetrieving,
      };
    }

    return postsResponses.errors.postNotFound;
  } catch (err: any) {
    return {
      ...postsResponses.errors.invalidFields,
      errors: err.errors?.map((error: any) => error.message),
    };
  }
};

const initGetPostHandler = (sequelizeClient: Sequelize): RequestHandler => {
  return async function getPostHandler(req: any, res, next): Promise<any> {
    try {
      const user = req.auth?.user?.dataValues;
      const response = await getPost(
        {
          postId: Number(req.params.id),
          userId: user.id,
        },
        sequelizeClient
      );

      return res.status(response.code).json({
        message: response.message,
        errors: response.errors,
        data: response.data,
      });
    } catch (error) {
      next(error);
    }
  };
};

const getAllPosts = async (sequelizeClient: Sequelize): Promise<any> => {
  const { models } = sequelizeClient;

  try {
    const searchedPosts: any = await models.Post.findAll({
      order: [['created_at', 'DESC']],
      where: { is_hidden: false },
      attributes: [
        'id',
        'title',
        'content',
        'userId',
        'created_at',
        'updated_at',
      ],
    });

    if (searchedPosts.length)
      return {
        data: searchedPosts,
        ...postsResponses.success.postsRetrieving,
      };

    return postsResponses.errors.postNotFound;
  } catch (e: any) {
    return {
      ...postsResponses.errors.invalidFields,
      errors: e.errors?.map((err: any) => err.message),
    };
  }
};

const initGetAllPostsHandler = (sequelizeClient: Sequelize): RequestHandler => {
  return async function getAllPostsHandler(req, res, next): Promise<any> {
    try {
      const response = await getAllPosts(sequelizeClient);

      return res.status(response.statusCode).json({
        message: response.message,
        errors: response.errors,
        data: response.data,
      });
    } catch (error) {
      next(error);
    }
  };
};

export const initPostsRouter = (sequelizeClient: Sequelize): Router => {
  const router = Router({ mergeParams: true });

  const tokenValidation = initTokenValidationHandler(sequelizeClient);

  router
    .route('/publish')
    .post(tokenValidation, initCreatePostHandler(sequelizeClient));

  router
    .route('/:id')
    .delete(tokenValidation, initDeletePostHandler(sequelizeClient));

  router
    .route('/:id')
    .put(tokenValidation, initUpdatePostHandler(sequelizeClient));

  router
    .route('/:id')
    .get(tokenValidation, initGetPostHandler(sequelizeClient));

  router
    .route('/')
    .get(tokenValidation, initGetAllPostsHandler(sequelizeClient));

  return router;
};

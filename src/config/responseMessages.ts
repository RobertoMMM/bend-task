export const usersResponses = {
  success: {
    userCreated: { code: 201, message: 'User created successfully.' },
    userUpdated: { code: 200, message: 'User updated successfully.' },
    userDeleted: { code: 204, message: 'User deleted successfully.' },
    login: { code: 200, message: 'Successfully logged in.' },
  },
  errors: {
    invalidCredentials: { code: 401, message: 'Invalid credentials' },
    notBearer: {
      code: 401,
      message: 'Unable to authenticate, need: Bearer authorization',
    },
    invalidToken: {
      code: 403,
      message: 'Invalid authorization token',
    },
    missingToken: {
      code: 401,
      message: 'No token was provided',
    },
    notFound: {
      code: 404,
      message: 'No user was found',
    },
  },
  dbValidation: {
    name: {
      unique: 'Name address already in use',
      len: 'Name must be between 5 and 50 characters long',
    },
    email: {
      unique: 'Email address already in use!',
      isEmail: 'Please enter a valid email address',
    },
    passwordHash: {
      len: 'Password hash must be exactly 64 characters long',
    },
  },
};

export const postsResponses = {
  success: {
    postCreated: { code: 201, message: 'Post created successfully.' },
    postUpdated: { code: 200, message: 'Post updated successfully.' },
    postDeleted: { code: 204, message: 'Post deleted successfully.' },
    postRetrieving: { code: 200, message: 'Post retrieved successfully' },
    postsRetrieving: { code: 200, message: 'Posts retrieved successfully' },
  },
  errors: {
    invalidFields: { code: 401, message: 'Invalid fields' },
    postNotFound: { code: 404, message: 'Post not found.' },
  },
  dbValidation: {
    content: {
      len: 'Content must be between 5 and 1000 characters',
    },
    title: {
      len: 'Title must be between 5 and 100 characters',
    },
  },
};

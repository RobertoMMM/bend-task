import { JwtPayload } from 'jsonwebtoken';
import { User } from '../models/users';

export enum UserType {
  ADMIN = 'admin',
  BLOGGER = 'blogger',
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
}

export interface LoginUserData {
  email: string;
  password: string;
}

export interface PublishPostData {
  title: string;
  content: string;
  isHidden: boolean;
  userId: number;
}

export interface GetPostData {
  postId: number;
  userId: number;
}

export interface DeletePostData {
  postId: number;
  userId: number;
}

export interface UpdatePostData {
  title?: string;
  content?: string;
  isHidden?: boolean;
}

export interface TokenData extends JwtPayload {
  name: string;
  isAdmin: boolean;
}

export interface RequestAuth {
  token: string;
  user: User;
}

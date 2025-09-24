/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */

import type { CreateUserDto } from '../models/CreateUserDto';
import type { UpdateUserDto } from '../models/UpdateUserDto';
import type { User } from '../models/User';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UsersService {
  /**
   * Create a new user
   * @param requestBody
   * @returns User User created successfully
   * @throws ApiError
   */
  public static usersControllerCreate(
    requestBody: CreateUserDto,
  ): CancelablePromise<User> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/users',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Get all users
   * @returns User List of users
   * @throws ApiError
   */
  public static usersControllerFindAll(): CancelablePromise<Array<User>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/users',
    });
  }
  /**
   * Get user by ID
   * @param id
   * @returns User User found
   * @throws ApiError
   */
  public static usersControllerFindOne(id: string): CancelablePromise<User> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/users/{id}',
      path: {
        id: id,
      },
      errors: {
        404: `User not found`,
      },
    });
  }
  /**
   * Update user
   * @param id
   * @param requestBody
   * @returns User User updated successfully
   * @throws ApiError
   */
  public static usersControllerUpdate(
    id: string,
    requestBody: UpdateUserDto,
  ): CancelablePromise<User> {
    return __request(OpenAPI, {
      method: 'PATCH',
      url: '/users/{id}',
      path: {
        id: id,
      },
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        404: `User not found`,
      },
    });
  }
  /**
   * Delete user
   * @param id
   * @returns any User deleted successfully
   * @throws ApiError
   */
  public static usersControllerRemove(id: string): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/users/{id}',
      path: {
        id: id,
      },
    });
  }
}

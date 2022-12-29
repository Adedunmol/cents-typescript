require('dotenv').config()
import * as AuthService from '../service/auth.service'
import supertest from 'supertest';
// import { MongoMemoryServer } from 'mongodb-memory-server'
import app from '../app';
import mongoose from 'mongoose';
import User from '../models/user.model';
import { loginController } from '../controllers/auth.controller';

const userId = new mongoose.Types.ObjectId().toString()

const userPayload = {
    _id: userId,
    email: 'nobody@test.com',
    fullName: 'mr test',
    roles: {
        User: 1984
    },
    refreshToken: [],
    save: () => true
}

const userInput = {
    email: 'nobody@test.com',
    fullName: 'mr test',
    password: 'Password123',
    passwordConfirmation: 'Password123',
    roles: {
        User: 1984
    }
}

describe('auth', () => {

    describe('register user route', () => {
        
        describe('given the user does not exist', () => {

            it('should create a new user and return the user payload', async () => {
                const createUserServiceMock = jest
                    .spyOn(AuthService, 'createUser')
                    // @ts-ignore
                    .mockReturnValueOnce(userPayload)

                const { statusCode, body } = await supertest(app).post('/api/v1/auth/register').send(userInput)
            
                expect(statusCode).toBe(201)

                //expect(body.user).toEqual(userPayload)

                expect(createUserServiceMock).toHaveBeenCalledWith(userInput)
            })
        })

        describe('given the passwords do not match', () => {

            it('should return a 400', async () => {
                const createUserServiceMock = jest
                .spyOn(AuthService, 'createUser')
                // @ts-ignore
                .mockReturnValueOnce(userPayload)

            const { statusCode } = await supertest(app).post('/api/v1/auth/register').send({ ...userInput, passwordConfirmation: 'does not match' })
        
            expect(statusCode).toBe(400)

            expect(createUserServiceMock).not.toHaveBeenCalled()

            })
        })

        describe('given the user exists', () => {

            it('should return 409', async () => {
                const createUserServiceMock = jest
                    .spyOn(AuthService, 'createUser')
                    .mockRejectedValue('user exists')

                const { statusCode } = await supertest(app).post('/api/v1/auth/register').send(userInput)

                expect(statusCode).toBe(409)

                expect(createUserServiceMock).toHaveBeenCalled()
            })
        })
    })

    describe('login user route', () => {

        describe('given valid details', () => {
            
            it('should send a 200', async () => {
                jest
                .spyOn(AuthService, 'findUser')
                // @ts-ignore
                .mockReturnValue(userPayload)

                jest
                .spyOn(AuthService, 'validatePassword')
                // @ts-ignore
                .mockReturnValue(userPayload)

                const json = jest.fn()
                const cookie = jest.fn()
                const status = jest.fn(code => ({
                    json: jest.fn()
                }))

                const req = {
                    body: { ...userInput }
                }

                const res = {
                    json,
                    cookie,
                    status
                }

                // @ts-ignore
                const result = await loginController(req, res)

                expect(status).toHaveBeenCalledWith(200)
            })
        })

        describe('given invalid details', () => {

            it('should send a 401', async () => {

            })
        })
    })
})
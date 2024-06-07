require('dotenv').config()
import * as AuthService from '../service/auth.service'
import supertest from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app';
import mongoose from 'mongoose';
import User from '../models/user.model';
import { loginController, logoutController, refreshTokenController } from '../controllers/auth.controller';
import { UnauthorizedError } from '../errors';
import * as queue from '../queue/producer';
import UserOTPVerification from '../models/user-otp-verification.model';

const userId = new mongoose.Types.ObjectId().toString()


const userInput = {
    username: 'test',
    email: 'nobody@test.com',
    fullName: 'mr test',
    password: 'Password123',
    passwordConfirmation: 'Password123',
    roles: {
        User: 1984
    }
}


const userPayload = {
    ...userInput,
    refreshToken: [],
    save: () => true
}

const otp = {
    userId,
    otp: 'hashedotp',
    expiresAt: Date.now() + 100000
}

describe('auth', () => {

    describe('register user route', () => {
        
        describe('given the user does not exist', () => {

            it('should create a new user and return the user payload', async () => {
                const createUserServiceMock = jest
                    .spyOn(AuthService, 'createUser')
                    // @ts-ignore
                    .mockReturnValueOnce(userPayload)
                const sendToQueueMock = jest
                    .spyOn(queue, 'sendToQueue')
                    .mockResolvedValue()
                
                const userOTPMock = jest
                    .spyOn(UserOTPVerification, 'create')
                    .mockReturnValueOnce()

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
                const sendToQueueMock = jest
                .spyOn(queue, 'sendToQueue')
                .mockResolvedValue()

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

                const sendToQueueMock = jest
                    .spyOn(queue, 'sendToQueue')
                    .mockResolvedValue()

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
                .spyOn(AuthService, 'findUserByEmail')
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
                jest
                .spyOn(AuthService, 'findUserByEmail')
                // @ts-ignore
                .mockReturnValue(userPayload)

                jest
                .spyOn(AuthService, 'validatePassword')
                // @ts-ignore
                .mockReturnValue(false)

                const json = jest.fn()
                const cookie = jest.fn()
                const status = jest.fn()

                const req = {
                    body: { ...userInput }
                }

                const res = {
                    json,
                    cookie,
                    status
                }

                // @ts-ignore
                //const error = await loginController(req, res)

                await expect(async () => { 
                    // @ts-ignore
                    await loginController(req, res) 
                }).rejects.toBeInstanceOf(UnauthorizedError)
            })
        })
    })

    describe('logout user route', () => {

        describe('given the user is logged in', () => {

            it('should return 204', async () => {

                jest.spyOn(AuthService, 'findUserWithToken')
                // @ts-ignore
                .mockReturnValue(userPayload)

                const cookies = jest.fn().mockReturnValue('testingcookie')
                const clearCookie = jest.fn()
                const sendStatus = jest.fn()

                const req = {
                    cookies
                }

                const res = {
                    clearCookie,
                    sendStatus
                }

                // @ts-ignore
                const result  = await logoutController(req, res)

                expect(sendStatus).toHaveBeenCalled()
            })
        })
    })

    describe('refresh-token route', () => {

        describe('given the user has cookies', () => {

            it('should return new access token', async () => {

                const refreshToken = jwt.sign({ email: userPayload.email }, process.env.REFRESH_TOKEN_SECRET as string, { expiresIn: '1d' })

                jest.spyOn(AuthService, 'findUserWithToken')
                // @ts-ignore
                .mockReturnValue(userPayload)

                const clearCookie = jest.fn()
                const cookie = jest.fn()
                const status = jest.fn(() => {
                    return {
                        json: jest.fn()
                    }
                })
                const sendStatus = jest.fn()

                const req = {
                    cookies: {
                        jwt: refreshToken
                    }
                }

                const res = {
                    clearCookie,
                    status,
                    cookie,
                    sendStatus
                }

                // @ts-ignore
                const result = await refreshTokenController(req, res)

                expect(status).toHaveBeenCalledWith(200)
            })
        })

        describe('given the user does not have a cookie', () => {

            it('should throw an unauthorized error', () => {

                const clearCookie = jest.fn()
                const cookie = jest.fn()
                const status = jest.fn(() => {
                    return {
                        json: jest.fn()
                    }
                })
                const sendStatus = jest.fn()

                const req = {
                    
                }

                const res = {
                    clearCookie,
                    status,
                    cookie,
                    sendStatus
                }

                // @ts-ignore
                expect(() => refreshTokenController(req, res)).rejects.toThrow()
            })
        })
    })
})
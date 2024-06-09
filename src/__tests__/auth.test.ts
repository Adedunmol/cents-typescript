require('dotenv').config()
import * as AuthService from '../service/auth.service'
import supertest from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app';
import mongoose from 'mongoose';
import { loginController, logoutController, refreshTokenController } from '../controllers/auth.controller';
import { UnauthorizedError } from '../errors';
import * as queue from '../queue/producer';
import UserOTPVerification from '../models/user-otp-verification.model';
import bcrypt, { compare } from 'bcrypt';

const bcryptMock = { compare }

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
    
    describe('verify-otp route', () => {

        describe('given no otp found for user', () => {

            it('should throw a bad request error', async () => {

                const data = { userId, otp: "1235" }

                jest
                .spyOn(UserOTPVerification, 'find')
                .mockResolvedValue([])

                jest
                .spyOn(AuthService, 'deleteUserOtp')
                .mockResolvedValue({} as any)

                const { statusCode, body } = await supertest(app).post('/api/v1/auth/verify-otp').send(data)

                expect(statusCode).toBe(400)
            })
        })

        describe('given no user details sent', () => {

            it('should throw a bad request error', async () => {
                
                const { statusCode, body } = await supertest(app).post('/api/v1/auth/verify-otp')

                expect(statusCode).toBe(400)
            })
        })

        describe('given the otp has expired', () => {

            it('should throw a bad request error', async () => {

                jest
                .spyOn(UserOTPVerification, 'find')
                .mockResolvedValue([{ expiresAt: Date.now() - 10, otp: "hashedOtp" }])

                jest
                .spyOn(AuthService, 'deleteUserOtp')
                .mockResolvedValue({} as any)

                const data = { userId, otp: "1235" }

                const { statusCode, body } = await supertest(app).post('/api/v1/auth/verify-otp').send(data)

                expect(statusCode).toBe(400)                
            })
        })

        describe('given the otp is not valid', () => {

            it('should throw a bad request error', async () => {

                jest
                .spyOn(UserOTPVerification, 'find')
                .mockResolvedValue([{ expiresAt: Date.now() + 1000, otp: 'hashedOtp' }])

                jest
                .spyOn(bcryptMock, 'compare')
                .mockImplementation((plain, hash) => Promise.resolve(false))

                const data = { userId, otp: "1235" }

                const { statusCode, body } = await supertest(app).post('/api/v1/auth/verify-otp').send(data)

                expect(statusCode).toBe(400)
            })
        })

        describe('given the otp is valid', () => {

            it('should return a success', async () => {

                jest.clearAllMocks()

                const payload = {
                    userId,
                    ...userInput,
                    otp: '1234'
                }
                const userOTPVerification = {
                    userId,
                    expiresAt: Date.now() + 100000,
                    otp: bcrypt.hashSync(payload.otp, 10)
                }

                jest
                .spyOn(AuthService, 'findUserWithOtp')
                .mockResolvedValue([userOTPVerification] as any[])

                jest
                .spyOn(bcryptMock, 'compare')
                .mockImplementation((plain, hash) => Promise.resolve(true))

                jest
                .spyOn(AuthService, 'updateUserVerification')
                .mockResolvedValue(userPayload)

                jest
                .spyOn(AuthService, 'deleteUserOtp')
                .mockResolvedValue({} as any)

                const { statusCode, body } = await supertest(app).post('/api/v2/auth/verify-otp').send(payload)

                expect(statusCode).toBe(200)                
            })
        })
    })

    describe('resend otp route', () => {

        describe('given user details not sent', ()=> {

            it('should throw a bad request error', async () => {

                const { statusCode, body } = await supertest(app).post('/api/v1/auth/resend-otp')

                expect(statusCode).toBe(400)
            })
        })

        describe('given user details', ()=> {

            it('should return a success', async () => {

                jest
                .spyOn(AuthService, 'generateOtp')
                .mockResolvedValue('1234')

                jest
                .spyOn(AuthService, 'deleteUserOtp')
                .mockResolvedValue({} as any)

                const sendToQueueMock = jest
                .spyOn(queue, 'sendToQueue')
                .mockResolvedValue()

                const payload = {
                    userId,
                    ...userInput
                }

                const { statusCode, body } = await supertest(app).post('/api/v1/auth/resend-otp').send(payload)

                expect(statusCode).toBe(200)
            })
        })
    })

    describe('forgot password route', () => {

        describe('given no user exists with the email given', () => {

            it('should throw a bad request error', async () => {
               
                jest.spyOn(AuthService, 'findUserByEmail')
                // @ts-ignore
                .mockReturnValue(null)

                const { statusCode, body } = await supertest(app).post('/api/v1/auth/forgot-password').send(userInput)

                expect(statusCode).toBe(400)
            })
        })

        describe('given empty payload sent', () => {

            it('should return a 400', async () => {
               
                jest.spyOn(AuthService, 'findUserByEmail')
                // @ts-ignore
                .mockReturnValue(null)


                const { statusCode, body } = await supertest(app).post('/api/v1/auth/forgot-password').send({})

                expect(statusCode).toBe(400)
            })
        })

        describe('given user not verified', () => {

            it('should return a 400', async () => {
                const payload = {
                    ...userPayload,
                    verified: false
                }
               
                jest.spyOn(AuthService, 'findUserByEmail')
                // @ts-ignore
                .mockReturnValue(null)


                const { statusCode, body } = await supertest(app).post('/api/v1/auth/forgot-password').send(userInput)

                expect(statusCode).toBe(400)
            })
        })

        describe('given valid data', () => {

            it('should return a 200', async () => {
               
                const userOTPVerification = {
                    userId,
                    expiresAt: Date.now() + 100,
                    otp: 'somerandomhash'
                }

                jest
                .spyOn(AuthService, 'generateOtp')
                .mockResolvedValue('1234')

                jest.spyOn(AuthService, 'findUserByEmail')
                // @ts-ignore
                .mockReturnValue(userPayload)

                jest
                .spyOn(AuthService, 'deleteUserOtp')
                .mockResolvedValue({} as any)

                const sendToQueueMock = jest
                .spyOn(queue, 'sendToQueue')
                .mockResolvedValue()

                const { statusCode, body } = await supertest(app).post('/api/v1/auth/forgot-password').send(userInput)

                expect(statusCode).toBe(200)
            })
        })
    })

    
    describe('reset password route', () => {

        describe('given no user exists with the email given', () => {

            it('should throw a bad request error', async () => {
               
                jest.spyOn(AuthService, 'findUserByEmail')
                // @ts-ignore
                .mockReturnValue(null)

                const { statusCode, body } = await supertest(app).post('/api/v1/auth/reset').send(userInput)

                expect(statusCode).toBe(400)
            })
        })

        describe('given empty payload sent', () => {

            it('should throw a bad request error', async () => {
               
                jest.spyOn(AuthService, 'findUserByEmail')
                // @ts-ignore
                .mockReturnValue(null)

                const { statusCode, body } = await supertest(app).post('/api/v1/auth/reset').send({})

                expect(statusCode).toBe(400)
            })
        })

        describe('given otp sent to user not found', ()=> {

            it('should throw a bad request error', async () => {
                const data = { userId, otp: "1235" }

                jest
                .spyOn(AuthService, 'findUserWithOtp')
                .mockResolvedValue([])

                jest
                .spyOn(AuthService, 'deleteUserOtp')
                .mockResolvedValue({} as any)

                const { statusCode, body } = await supertest(app).post('/api/v1/auth/reset').send(data)

                expect(statusCode).toBe(400)
            })
        })

        describe('given otp sent has expired', ()=> {

            it('should return a 400', async () => {
                jest
                .spyOn(AuthService, 'findUserWithOtp')
                .mockResolvedValue([{ expiresAt: Date.now() - 10, otp: "hashedOtp" }] as any[])

                jest
                .spyOn(AuthService, 'deleteUserOtp')
                .mockResolvedValue({} as any)

                const data = { userId, otp: "1235" }

                const { statusCode, body } = await supertest(app).post('/api/v1/auth/reset').send(data)

                expect(statusCode).toBe(400)
            })
        })

        describe('given an invalid otp', ()=> {

            it('should throw a bad request error', async () => {
                jest
                .spyOn(AuthService, 'findUserWithOtp')
                .mockResolvedValue([{ expiresAt: Date.now() + 1000, otp: 'hashedOtp' }] as any[])

                jest
                .spyOn(bcryptMock, 'compare')
                .mockImplementation((plain, hash) => Promise.resolve(false))

                const data = { userId, otp: "1235" }

                const { statusCode, body } = await supertest(app).post('/api/v1/auth/reset').send(data)

                expect(statusCode).toBe(400)
            })
        })

        describe('given valid data', () => {

            it('should return a success', async () => {
               
                const payload = {
                    userId,
                    ...userInput,
                    otp: '1234'
                }
                const userOTPVerification = {
                    userId,
                    expiresAt: Date.now() + 100000,
                    otp: bcrypt.hashSync(payload.otp, 10)
                }

                jest.spyOn(AuthService, 'findUserByEmail')
                // @ts-ignore
                .mockReturnValue(userPayload)

                jest
                .spyOn(AuthService, 'deleteUserOtp')
                .mockResolvedValue({} as any)

                jest
                .spyOn(UserOTPVerification, 'find')
                .mockResolvedValue([userOTPVerification])

                // jest
                // .spyOn(bcryptMock, 'compare')
                // .mockImplementation((plain, hash) => Promise.resolve(true))

                const { statusCode, body } = await supertest(app).post('/api/v1/auth/reset').send(payload)

                expect(statusCode).toBe(200)
            })
        })
    })
})
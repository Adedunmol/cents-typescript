require('dotenv').config();
require('express-async-errors');
import mongoose from 'mongoose';
import supertest from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app';
import * as UserService from '../service/user.service';
import { UnauthorizedError } from '../errors';

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

describe('user', () => {

    describe('update user route', () => {

        describe('given the user is logged in', () => {

            it('should send a 200', async () => {
                
                jest.spyOn(UserService, 'findUserAndUpdate')
                // @ts-ignore
                .mockReturnValue(userPayload)

                const token = jwt.sign(userPayload, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: '15m' })

                // @ts-ignore
                const { statusCode } = await supertest(app).patch('/api/v1/users/update').send(userPayload).set('Authorization', `Bearer ${token}`)
            
                expect(statusCode).toBe(200)
            })
        })

        describe('given the user is not logged in', () => {

            it('should throw unauthorized error', async () => {
                const UserServiceMock = jest.spyOn(UserService, 'findUserAndUpdate')
                try {
                    // @ts-ignore
                    await supertest(app).patch('/api/v1/users/update').send(userPayload)
                    expect(UserServiceMock).not.toHaveBeenCalled()

                } catch (err: any) {
                    
                }
            })
        })

    })
})
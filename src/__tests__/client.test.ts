require('dotenv').config();
require('express-async-errors');
import mongoose from 'mongoose';
import supertest from 'supertest';
import jwt from 'jsonwebtoken';
import * as ClientService from '../service/client.service';
import * as InvoiceService from '../service/invoice.service';
import app from '../app';


const userId = new mongoose.Types.ObjectId().toString()
const clientId = new mongoose.Types.ObjectId().toString()

const invoicePayload = {
    clientFullName: 'mr client',
    clientEmail: 'nobody@test.com',
    clientPhoneNumber: '0701234567',
    services: {},
    total: 100,
    dueDate: Date.now(),
    fullyPaid: false,
    createdBy: new mongoose.Types.ObjectId().toString(),
    createdFor: new mongoose.Types.ObjectId().toString(),
    createdAt: Date.now(),
    updatedAt: Date.now()
}

const clientPayload =  {
    _id: clientId,
    fullName: 'mr client',
    email: 'client@test.com',
    phoneNumber: '0701234567',
    createdBy: userId,
    createdAt: Date.now(),
    updatedAt: Date.now(),
}

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


describe('client', () => {

    describe('get all clients route', () => {

        describe('given the user is logged in', () => {

            it('should return a list of users', async () => {

                jest.spyOn(ClientService, 'getAllClients')
                // @ts-ignore
                .mockReturnValue([clientPayload])

                const token = jwt.sign(userPayload, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: '15m' })

                // @ts-ignore
                const { statusCode } = await supertest(app).get('/api/v1/clients/').set('Authorization', `Bearer ${token}`)
            
                expect(statusCode).toBe(200)
            })
        })
    })

    describe('get client route', () => {

        describe('given the user id', () => {

            it('should return a user', async () => {

                jest.spyOn(ClientService, 'getClient')
                // @ts-ignore
                .mockReturnValue(clientPayload)

                const token = jwt.sign(userPayload, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: '15m' })

                // @ts-ignore
                const { statusCode } = await supertest(app).get(`/api/v1/clients/${userId}`).set('Authorization', `Bearer ${token}`)
            
                expect(statusCode).toBe(200)
            })
        })
    })

    describe('test create client route', () => {

        describe('given valid data for a client', () => {

            it('should return a 201',  async () => {

                jest.spyOn(ClientService, 'createClient')
                // @ts-ignore
                .mockReturnValue(clientPayload)

                const token = jwt.sign(userPayload, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: '15m' })

                // @ts-ignore
                const { statusCode } = await supertest(app).post(`/api/v1/clients/`).send(clientPayload).set('Authorization', `Bearer ${token}`)
            
                expect(statusCode).toBe(201)

            })
        })

        describe('given invalid data for a client', () => {

            it('should return a 400',  async () => {

                const clientPayload =  {
                    _id: clientId,
                    fullName: 'mr client',
                    createdBy: userId,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                }

                jest.spyOn(ClientService, 'createClient')
                // @ts-ignore
                .mockReturnValue(clientPayload)

                const token = jwt.sign(userPayload, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: '15m' })

                // @ts-ignore
                const { statusCode } = await supertest(app).post(`/api/v1/clients/`).send(clientPayload).set('Authorization', `Bearer ${token}`)
            
                expect(statusCode).toBe(400)

            })
        })
    })

    describe('delete client route', () => {

        describe('given a client id is provided and client is in db', () => {

            it('should return a 200', async () => {
                
                jest.spyOn(ClientService, 'getClient')
                // @ts-ignore
                .mockReturnValue(clientPayload)

                jest.spyOn(ClientService, 'deleteInvoices')
                // @ts-ignore
                .mockReturnValue(invoicePayload)

                jest.spyOn(ClientService, 'deleteClient')
                // @ts-ignore
                .mockReturnValue(clientPayload)

                const token = jwt.sign(userPayload, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: '15m' })

                const { statusCode } = await supertest(app).delete(`/api/v1/clients/${userId}`).set('Authorization', `Bearer ${token}`)

                expect(statusCode).toBe(200)
            })
        })

        describe('given a client id is provided and client is not in db', () => {

            it('should return a 404', async () => {
                jest.spyOn(ClientService, 'getClient')
                // @ts-ignore
                .mockReturnValue(false)

                const token = jwt.sign(userPayload, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: '15m' })

                const { statusCode } = await supertest(app).delete(`/api/v1/clients/${userId}`).set('Authorization', `Bearer ${token}`)

                expect(statusCode).toBe(404)
            })
        })
    })

    describe('update client route', () => {

        describe('given the client id is provided and client is in db', () => {

            it('should return a 200', async () => {

                jest.spyOn(ClientService, 'getClient')
                // @ts-ignore
                .mockReturnValue(clientPayload)

                jest.spyOn(InvoiceService, 'updateInvoices')
                // @ts-ignore
                .mockReturnValue(invoicePayload)

                jest.spyOn(ClientService, 'updateClient')
                // @ts-ignore
                .mockReturnValue(clientPayload)

                const token = jwt.sign(userPayload, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: '15m' })

                const { statusCode } = await supertest(app).patch(`/api/v1/clients/${userId}`).send(clientPayload).set('Authorization', `Bearer ${token}`)

                expect(statusCode).toBe(200)
            })
        })
    })
})
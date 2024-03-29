require('dotenv').config();
import mongoose from 'mongoose';
import supertest from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app';
import * as ClientService from '../service/client.service';
import * as InvoiceService from '../service/invoice.service';

const userId = new mongoose.Types.ObjectId().toString()
const invoiceId = new mongoose.Types.ObjectId().toString()
const clientId = new mongoose.Types.ObjectId().toString()

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

const invoicePayload = {
    _id: invoiceId,
    clientFullName: 'mr client',
    clientEmail: 'nobody@test.com',
    clientPhoneNumber: '0701234567',
    services: [],
    total: 100,
    dueDate: new Date(),
    fullyPaid: false,
    createdBy: new mongoose.Types.ObjectId().toString(),
    createdFor: new mongoose.Types.ObjectId().toString(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    save: () => true
}

const invoiceInput = {
    services: [{
        "item": "test",
        "rate": 19,
        "hours": 10,
        "paid": true
    }],
    dueDate: Date.now()
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

describe('invoice', () => {

    describe('create invoice route', () => {

        describe('given valid data is sent', () => {

            it('should return a 201', async () => {

                try {
                    jest.spyOn(ClientService, 'getClient')
                // @ts-ignore
                .mockReturnValue(clientPayload)

                jest.spyOn(InvoiceService, 'createInvoice')
                // @ts-ignore
                .mockReturnValue(invoicePayload)

                const roles = Object.values(userPayload.roles)

                const token = jwt.sign({ UserInfo: { ...userPayload, roles } }, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: '15m' })

                const { statusCode } = await supertest(app).post(`/api/v1/clients/${clientPayload._id}/invoices`).send(invoiceInput).set('Authorization', `Bearer ${token}`)

                expect(statusCode).toBe(201)
                }catch (err: any) {

                }
            })
        })
    })

    describe('get client\'s invoice route', () => {

        describe('given the id of the invoice is provided', () => {

            it('should return a 200', async () => {

                jest.spyOn(ClientService, 'getClient')
                // @ts-ignore
                .mockReturnValue(clientPayload)

                jest.spyOn(InvoiceService, 'findInvoice')
                // @ts-ignore
                .mockReturnValue(invoicePayload)

                const roles = Object.values(userPayload.roles)

                const token = jwt.sign({ UserInfo: { ...userPayload, roles } }, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: '15m' })

                const { statusCode } = await supertest(app).get(`/api/v1/clients/${clientPayload._id}/invoices/${invoicePayload._id}`).send(invoiceInput).set('Authorization', `Bearer ${token}`)

                expect(statusCode).toBe(200)
            })
        })
    })

    describe('get all invoices route', () => {

        describe('given the user is logged in', () => {

            it('should return a list of invoices', async () => {

                jest.spyOn(InvoiceService, 'getInvoices')
                // @ts-ignore
                .mockReturnValue([ invoicePayload ])

                const roles = Object.values(userPayload.roles)

                const token = jwt.sign({ UserInfo: { ...userPayload, roles } }, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: '15m' })

                const { statusCode } = await supertest(app).get(`/api/v1/invoices/`).send(invoiceInput).set('Authorization', `Bearer ${token}`)

                expect(statusCode).toBe(200)
            })
        })
    })

    describe('update invoice route', () => {

        describe('given the invoice is found and valid data is sent', () => {

            it('should return a 200', async () => {
                
                jest.spyOn(ClientService, 'getClient')
                // @ts-ignore
                .mockReturnValue(clientPayload)

                jest.spyOn(InvoiceService, 'findAndUpdateInvoice')
                // @ts-ignore
                .mockReturnValue(invoicePayload)

                const roles = Object.values(userPayload.roles)

                const token = jwt.sign({ UserInfo: { ...userPayload, roles } }, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: '15m' })
                
                const updateObj = { 'clientFullName': 'newClient' }

                const { statusCode } = await supertest(app).patch(`/api/v1/clients/${clientPayload._id}/invoices/${invoicePayload._id}`).send(updateObj).set('Authorization', `Bearer ${token}`)

                expect(statusCode).toBe(200)
            })
        })
    })
})
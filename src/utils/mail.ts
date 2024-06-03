import { DocumentDefinition } from "mongoose"
import { readFile } from 'fs/promises'
import { compile, log } from 'handlebars'
import { InvoiceDocument } from "../models/invoice.model"
import path from 'path'
import nodemailer from 'nodemailer'
import logger from "./logger"
import UserOTPVerification from "../models/user-otp-verification.model"
import bcrypt from "bcrypt"

interface emailData {
    to: string
    subject: string
    text: string
    html: string
    invoice: DocumentDefinition<InvoiceDocument>
}

const OTP_EXPIRATION = 3600000

export const sendOTPVerificationEmail = async ({ _id, email }: { _id: string, email: string }, res: Response) => {
    try {
        const otp = `${Math.floor(1000 + Math.random() * 9000)}`

        const hashedOTP = await bcrypt.hash(otp, 10)

        const userOTPVerification = await UserOTPVerification.create({
            userId: _id,
            otp: hashedOTP,
            expiresAt: Date.now() + OTP_EXPIRATION
        })

        const message = `Enter ${otp} in the app to verify your email address and complete registration. This code expires in 1 hour`
        const html = `</p>Enter <b>${otp}</b> in the app to verify your email address and complete registration</p>. <p>This code <b>expires in 1 hour</b>.</p>`
        
        logger.info("sending verification mail")
        // send mail
        // await sendMail(email, "OTP verification", message, html)

        // return res.status(200).json({ status: "pending", message: "Verification OTP email sent", data: { userId: _id, email } })
    } catch(err: any) {

        logger.error("could not send verification mail")
        logger.error(err)
        throw new Error("Could not send verification mail")
        // return res.status(500).json({ status: "error", message: err.message })
    }
}

const sendMail = async (emailData: emailData) => {
    
    const htmlFilePath = await readFile(
        path.join(__dirname, '..', 'public', 'html', emailData.html),
        'utf-8'
    );

    const template = compile(htmlFilePath);

    const htmlToSend = template({ id: String(emailData.invoice._id).slice(0, 8), clientFullName: emailData.invoice.clientFullName });

    const transport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.ADMIN,
            pass: process.env.EMAIL_PASSWORD
        }
    })

    transport.verify((err, success) => {
        if (err) {
            logger.error("mail verification failed")
            throw new Error("Can't send mails")
        }
    })

    const mailOptions = {
        from: `Cents 📧 ${process.env.ADMIN}`,
        to: emailData.to,
        subject: emailData.subject,
        text: emailData.text,
        html: htmlToSend,
        // html: html,
        attachments: emailData.invoice ? [{
            filename: `${String(emailData.invoice._id)}.pdf`,
            path: path.join(__dirname, '..', 'invoices', `${String(emailData.invoice._id)}.pdf`),
            contentType: 'application/pdf'
        }] : []
    }

    const result = await transport.sendMail(mailOptions)
    
}

export default sendMail;
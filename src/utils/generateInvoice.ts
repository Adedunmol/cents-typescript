import { DocumentDefinition } from "mongoose";
import { InvoiceDocument } from "../models/invoice.model";
import fs from 'fs'
import { formatDistance } from 'date-fns'
import PDFDocument from 'pdfkit'
import path from 'path'
import { utcToZonedTime } from "date-fns-tz";


async function createInvoice(invoice: DocumentDefinition<InvoiceDocument>, path: string) {
    let doc = new PDFDocument({ margin: 50 })

    generateHeader(doc)
    generateCustomerInformation(doc, invoice)
    generateInvoiceTable(doc, invoice)
    generateFooter(doc, invoice)

    doc.end()
    doc.pipe(fs.createWriteStream(path))
}


function generateHeader(doc: any) {
    doc//.image('logo.png', 50, 45, { width: 50 })
    .fillColor('#444444')
    .fontSize(20)
    .text('CENTS Inc.', 110, 57)
    .fontSize(10)
    .text("CENTS Inc.", 200, 50, { align: "right" })
    .text('123 Main Street', 200, 65, { align: 'right' })
    .text('New York, NY, 10025', 200, 80, { align: 'right' })
    .moveDown()
}


function generateFooter(doc: any, invoice: DocumentDefinition<InvoiceDocument>) {
    const dueDate = utcToZonedTime(invoice.dueDate, 'Europe/Paris', { addSuffix: true })
    doc.fontSize(
        10
    ).text(
        `Payment is due within ${ formatDistance(dueDate, new Date()) }. Thank you for your business.`,
        50,
        780,
        { align: 'center', width: 500 }
    )
}


function generateCustomerInformation(doc: any, invoice: DocumentDefinition<InvoiceDocument>) {
    doc
      .fillColor("#444444")
      .fontSize(20)
      .text("Invoice", 50, 160);
  
    generateHr(doc, 185);
  
    const customerInformationTop = 200;
  
    doc
      .fontSize(10)
      .text("Invoice Number:", 50, customerInformationTop)
      .font("Helvetica-Bold")
      .text(String(invoice._id).slice(0, 8), 150, customerInformationTop)
      .font("Helvetica")
      .text("Invoice Due Date:", 50, customerInformationTop + 15)
      .text(formatDate(new Date(invoice.dueDate)), 150, customerInformationTop + 15)
      
  
      .font("Helvetica-Bold")
      .text(invoice.clientFullName, 300, customerInformationTop)
      .font("Helvetica")
      .text(invoice.clientEmail, 300, customerInformationTop + 15)
      
      .moveDown();
  
    generateHr(doc, 252);
}


function generateTableRow(
    doc: any,
    y: number,
    description: string,
    unitCost: string,
    hours: string | number,
    lineTotal: string
  ) {
    doc
      .fontSize(10)
      .text(description, 50, y)
      .text(unitCost, 280, y, { width: 90, align: "right" })
      .text(hours, 370, y, { width: 90, align: "right" })
      .text(lineTotal, 0, y, { align: "right" });
}
  


function generateInvoiceTable(doc: any, invoice: DocumentDefinition<InvoiceDocument>) {
    let i;
    const invoiceTableTop = 330;
  
    doc.font("Helvetica-Bold");
    generateTableRow(
      doc,
      invoiceTableTop,
      "Description",
      "Unit Cost",
      "Hours",
      "Line Total"
    );
    generateHr(doc, invoiceTableTop + 20);
    doc.font("Helvetica");
  
    for (i = 0; i < invoice.services.length; i++) {
      const item = invoice.services[i];
      const position = invoiceTableTop + (i + 1) * 30;
      generateTableRow(
        doc,
        position,
        item.item,
        formatCurrency(item.rate),
        item.hours,
        formatCurrency(item.rate * item.hours)
      );
  
      generateHr(doc, position + 20);
    }
  
    const totalPosition = (invoiceTableTop + (i + 1) * 30) + 15 //25;
    doc.font("Helvetica-Bold");
    generateTableRow(
      doc,
      totalPosition,
      "",
      "Total:",
      "",
      formatCurrency(invoice.total)
    );
    doc.font("Helvetica");
}
  


function generateHr(doc: any, y: number) {
    doc
      .strokeColor("#aaaaaa")
      .lineWidth(1)
      .moveTo(50, y)
      .lineTo(550, y)
      .stroke();
}



function formatCurrency(amount: number) {
    return "$" + String(amount);
}
  

function formatDate(date: Date) {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
  
    return year + "/" + month + "/" + day;
}

export default createInvoice;
import PDFDocument from 'pdfkit';
import { Response } from 'express';

export const generateSalarySlip = (payroll: any, res: Response) => {
    const doc = new PDFDocument({ margin: 50 });

    // Pipe to response first
    doc.pipe(res);

    const employee = payroll.employee;

    // Header
    doc.fillColor('#444444')
        .fontSize(20)
        .text('SALARY DISBURSEMENT SLIP', { align: 'center' })
        .moveDown();

    doc.fontSize(10)
        .text('INTERNAL CORPORATE ADM PANELS', { align: 'center' })
        .text('STRATEGIC HUMAN CAPITAL MANAGEMENT', { align: 'center' })
        .moveDown();

    // Horizontal Line
    doc.moveTo(50, 150)
        .lineTo(550, 150)
        .stroke('#eeeeee');

    // Employee Info
    doc.moveDown(2);
    doc.fillColor('#000000')
        .fontSize(12)
        .font('Helvetica-Bold')
        .text(`Employee: ${employee.firstName} ${employee.lastName}`)
        .font('Helvetica')
        .fontSize(10)
        .text(`Position: ${employee.position || 'N/A'}`)
        .text(`Period: ${payroll.month} ${payroll.year}`)
        .text(`Reference ID: ${payroll._id.toString().toUpperCase()}`)
        .moveDown();

    // Financial Core Table Header
    const tableTop = 270;
    doc.font('Helvetica-Bold')
        .text('Description', 50, tableTop)
        .text('Amount', 400, tableTop, { align: 'right' });

    doc.moveTo(50, tableTop + 15)
        .lineTo(550, tableTop + 15)
        .stroke('#eeeeee');

    // Basic Salary
    let currentY = tableTop + 30;
    doc.font('Helvetica')
        .fillColor('#000000')
        .text('Basic Component', 50, currentY)
        .text(`$${payroll.basicSalary.toLocaleString()}`, 400, currentY, { align: 'right' });

    // Allowances
    currentY += 20;
    if (payroll.details && payroll.details.allowances && payroll.details.allowances.length > 0) {
        payroll.details.allowances.forEach((item: any) => {
            doc.fillColor('#10b981')
                .text(`(+) ${item.name}`, 50, currentY)
                .text(`$${item.amount.toLocaleString()}`, 400, currentY, { align: 'right' });
            currentY += 15;
        });
    }

    // Deductions
    if (payroll.details && payroll.details.deductions && payroll.details.deductions.length > 0) {
        payroll.details.deductions.forEach((item: any) => {
            doc.fillColor('#ef4444')
                .text(`(-) ${item.name}`, 50, currentY)
                .text(`$${item.amount.toLocaleString()}`, 400, currentY, { align: 'right' });
            currentY += 15;
        });
    }

    // Totals
    currentY += 20;
    doc.moveTo(50, currentY)
        .lineTo(550, currentY)
        .stroke('#eeeeee');

    currentY += 15;
    doc.fillColor('#000000')
        .font('Helvetica-Bold')
        .fontSize(14)
        .text('NET SALARY PAYOUT', 50, currentY)
        .text(`$${payroll.netSalary.toLocaleString()}`, 400, currentY, { align: 'right' });

    // Footer
    const footerTop = 700;
    doc.fontSize(8)
        .fillColor('#aaaaaa')
        .text('This is a computer-generated document. No signature is required.', 50, footerTop, { align: 'center' })
        .text('Confidential - Strategic Management Control', 50, footerTop + 15, { align: 'center' });

    // Finalize - this must be called last
    doc.end();
};

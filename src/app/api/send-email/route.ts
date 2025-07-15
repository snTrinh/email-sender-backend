// src/app/api/send-email/route.ts
// This file will be part of your 'email-sender-backend' Vercel project.

import { NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';

// Set your SendGrid API Key from environment variables
// This environment variable will be configured securely on Vercel.
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json();

    // Basic validation
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email, and message are required.' }, { status: 400 });
    }

    // Define the email content
    const msg = {
      to: 'snt.trinh@gmail.com', // Replace with the email address you want to receive messages at
      from: 'snt.trinh@gmail.com', // Replace with your SendGrid verified sender email
      subject: `Super Sus Piping Feedback from ${name}`,
      text: `
        Name: ${name}
        Email: ${email}
        Message: ${message}
      `,
      html: `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong> ${message}</p>
      `,
    };

    // Send the email
    await sgMail.send(msg);

    // Return a success response
    return NextResponse.json({ message: 'Email sent successfully!' }, { status: 200 });

  } catch (error) {
    console.error('Error sending email:', error);

    // Log SendGrid specific errors if available
    if (error instanceof Error && 'response' in error && error.response) {
      console.error(error.response.body);
    }

    // Return an error response
    return NextResponse.json({ error: 'Failed to send email.' }, { status: 500 });
  }
}

// You can also add a GET handler if you want to test the endpoint directly (optional)
export async function GET() {
  return NextResponse.json({ message: 'This is the email API endpoint. Use POST to send emails.' });
}

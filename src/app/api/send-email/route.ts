

import { NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';


declare const process: {
  env: {
    SENDGRID_API_KEY: string;
  };
};


interface EmailRequestBody {
  name: string;
  email: string;
  message: string;
}

interface SendGridErrorResponse {
    body?: unknown; 
    statusCode?: number;
    headers?: Record<string, string>;
  }

interface SendGridError extends Error {
    response?: SendGridErrorResponse;
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');


const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://sntrinh.github.io', 
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 
  'Access-Control-Allow-Headers': 'Content-Type, Authorization', 
};

export async function POST(request: Request) {
  try {

    const { name, email, message } = await request.json() as EmailRequestBody;


    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required.' },
        { status: 400, headers: corsHeaders } 
      );
    }


    const msg = {
      to: 'snt.trinh@gmail.com', 
      from: 'snt.trinh@gmail.com', 
      subject: `New Contact Form Submission from ${name}`,
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


    return NextResponse.json(
      { message: 'Email sent successfully!' },
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    console.error('Error sending email:', error);


    if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof (error as SendGridError).response === 'object' &&
        (error as SendGridError).response !== null
      ) {
        // Safely access .body using optional chaining
        console.error((error as SendGridError).response?.body);
      }

    return NextResponse.json(
      { error: 'Failed to send email.' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}


export async function GET() {
  return NextResponse.json(
    { message: 'This is the email API endpoint. Use POST to send emails.' },
    { status: 200, headers: corsHeaders }
  );
}

// src/app/api/send-email/route.ts
// This file will be part of your 'email-sender-backend' Vercel project.

import { NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';

// Ensure process.env types are available for TypeScript
// You might need to run `npm install --save-dev @types/node` in your backend project
// if you still see "Cannot find name 'process'" errors.
declare const process: {
  env: {
    SENDGRID_API_KEY: string;
  };
};

// Define the expected shape of the incoming JSON request body
interface EmailRequestBody {
  name: string;
  email: string;
  message: string;
}

// Define a type for the SendGrid error response body, if it's consistently structured
interface SendGridErrorResponse {
  body?: unknown; // Changed from 'any' to 'unknown' to satisfy ESLint rule
  statusCode?: number;
  headers?: Record<string, string>;
}

// Define a type for the SendGrid error object
interface SendGridError extends Error {
  response?: SendGridErrorResponse;
}

// Set your SendGrid API Key from environment variables
// This environment variable will be configured securely on Vercel.
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Changed to '*' to allow any origin
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', // Allow these HTTP methods
  'Access-Control-Allow-Headers': 'Content-Type, Authorization', // Allow these headers in requests
};

export async function POST(request: Request) {
  try {
    // Explicitly cast the result of request.json() to EmailRequestBody
    const { name, email, message } = await request.json() as EmailRequestBody;

    // Basic validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required.' },
        { status: 400, headers: corsHeaders } // Include CORS headers in error response too
      );
    }

    // Define the email content
    const msg = {
      to: 'YOUR_RECEIVING_EMAIL@example.com', // Replace with the email address you want to receive messages at
      from: 'YOUR_VERIFIED_SENDER_EMAIL@example.com', // Replace with your SendGrid verified sender email
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

    // Return a success response with CORS headers
    return NextResponse.json(
      { message: 'Email sent successfully!' },
      { status: 200, headers: corsHeaders }
    );

  } catch (error: unknown) { // Type 'error' as unknown first
    console.error('Error sending email:', error);

    // Use a type guard to check if the error is an instance of SendGridError
    // and then use optional chaining to safely access 'body'
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

    // Return an error response with CORS headers
    return NextResponse.json(
      { error: 'Failed to send email.' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Handle OPTIONS requests (preflight requests)
// Browsers send an OPTIONS request before a POST request to check CORS policies.
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}

// You can also add a GET handler if you want to test the endpoint directly (optional)
export async function GET() {
  return NextResponse.json(
    { message: 'This is the email API endpoint. Use POST to send emails.' },
    { status: 200, headers: corsHeaders }
  );
}

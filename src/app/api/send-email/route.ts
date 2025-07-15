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

// Set your SendGrid API Key from environment variables
// This environment variable will be configured securely on Vercel.
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

export async function POST(request: Request) {
  try {
    // Explicitly cast the result of request.json() to EmailRequestBody
    const { name, email, message } = await request.json() as EmailRequestBody;

    // Basic validation
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email, and message are required.' }, { status: 400 });
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

    // Return a success response
    return NextResponse.json({ message: 'Email sent successfully!' }, { status: 200 });

  } catch (error) {
    console.error('Error sending email:', error);

    // Log SendGrid specific errors if available
    if (error instanceof Error && 'response' in error && error.response) {
      console.error(error.response);
    }

    // Return an error response
    return NextResponse.json({ error: 'Failed to send email.' }, { status: 500 });
  }
}

// You can also add a GET handler if you want to test the endpoint directly (optional)
export async function GET() {
  return NextResponse.json({ message: 'This is the email API endpoint. Use POST to send emails.' });
}

// If you are still seeing "Cannot find module '@sendgrid/mail'" or "Cannot find module 'next/server'",
// try these troubleshooting steps in your 'email-sender-backend' project:
// 1. Delete node_modules and lock files:
//    rm -rf node_modules pnpm-lock.yaml  # If using pnpm
//    rm -rf node_modules package-lock.json # If using npm
// 2. Reinstall dependencies:
//    pnpm install # If using pnpm
//    npm install # If using npm
// 3. Restart your TypeScript server/IDE (e.g., close and reopen VS Code).
// 4. Check your tsconfig.json to ensure 'node_modules' is not excluded and 'types' array is correct.
//    It should generally look something like this for a Next.js project:
//    {
//      "compilerOptions": {
//        "target": "es5",
//        "lib": ["dom", "dom.iterable", "esnext"],
//        "allowJs": true,
//        "skipLibCheck": true,
//        "strict": true,
//        "forceConsistentCasingInFileNames": true,
//        "noEmit": true,
//        "esModuleInterop": true,
//        "module": "esnext",
//        "moduleResolution": "bundler", // Or "node" for older setups
//        "resolveJsonModule": true,
//        "isolatedModules": true,
//        "jsx": "preserve",
//        "incremental": true,
//        "plugins": [
//          {
//            "name": "next"
//          }
//        ],
//        "paths": {
//          "@/*": ["./src/*"]
//        }
//      },
//      "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
//      "exclude": ["node_modules"]
//    }

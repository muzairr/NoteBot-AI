// utils/email-utils.js
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const sesClient = new SESClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY
  }
});

export const sendEmail = async (toEmails, subject, text) => {
  try {
    // Ensure toEmails is always an array
    const emailArray = Array.isArray(toEmails) ? toEmails : [toEmails];
    
    // Clean and validate emails
    const cleanedEmails = emailArray
      .map(email => {
        if (typeof email === 'object' && email.S) {
          return email.S;
        }
        if (typeof email === 'string') {
          return email;
        }
        console.warn('Invalid email format:', email);
        return null;
      })
      .filter(email => email !== null && email.trim() !== '');

    // Log for debugging
    console.log('Cleaned emails:', cleanedEmails);
    
    if (cleanedEmails.length === 0) {
      throw new Error('No valid email addresses provided');
    }

    const command = new SendEmailCommand({
      Destination: {
        ToAddresses: cleanedEmails,
      },
      Message: {
        Body: {
          Text: { Data: text },
        },
        Subject: { Data: subject },
      },
      Source: "soap@slpeace.com", // Replace with your SES verified email
    });

    // Log the command for debugging
    console.log('SendEmailCommand:', JSON.stringify(command.input, null, 2));

    const result = await sesClient.send(command);
    console.log('Email sent successfully:', result);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      requestId: error.$metadata?.requestId
    });
    throw error;
  }
};
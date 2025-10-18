// utils/waitlist.js
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

const dynamoClient = new DynamoDBClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY
  }
});

const docClient = DynamoDBDocumentClient.from(dynamoClient);

export const addToWaitlist = async (email, name) => {
  try {
    const command = new PutCommand({
      TableName: 'slpeace-waitlist',
      Item: {
        email,
        name,
        timestamp: new Date().toISOString(),
        status: 'PENDING'
      }
    });

    await docClient.send(command);
    return true;
  } catch (error) {
    console.error('Error adding to waitlist:', error);
    throw error;
  }
};
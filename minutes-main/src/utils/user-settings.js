import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand,UpdateCommand  } from '@aws-sdk/lib-dynamodb';

const dynamoClient = new DynamoDBClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY
  }
});

const docClient = DynamoDBDocumentClient.from(dynamoClient, {
  marshallOptions: {
    // Remove undefined values when converting to DynamoDB format
    removeUndefinedValues: true,
    // Convert empty strings and sets to null
    convertEmptyValues: true
  }
});

export const initializeUserSettings = async (email) => {
  try {
    const defaultSettings = {
      firstTimeLogin: true,
      clientName: 'client',
      clinicianTitle: 'clinician',
      language: 'english',
      emailPreference: 'signup_email',
      customEmails: [email],
      perNoteEmails: false,
      subjectLinePreference: 'default'
    };

    const command = new PutCommand({
      TableName: 'user-settings',
      Item: {
        email,
        settings: defaultSettings,
        createdAt: new Date().toISOString()
      }
    });

    await docClient.send(command);
    return defaultSettings;
  } catch (error) {
    console.error('Error initializing user settings:', error);
    throw error;
  }
};

export const saveUserSettings = async (email, settings) => {
  try {
    // Clean up the settings object
    const cleanSettings = {
      ...settings,
      customEmails: Array.isArray(settings.customEmails)
        ? settings.customEmails.filter(email => typeof email === 'string' && email.length > 0)
        : [],
      perNoteEmails: Boolean(settings.perNoteEmails),
      firstTimeLogin: Boolean(settings.firstTimeLogin)
    };

    // Step 1: Retrieve the current item from DynamoDB to preserve other fields
    const getCommand = new GetCommand({
      TableName: 'user-settings',
      Key: { email }
    });

    const existingItem = await docClient.send(getCommand);

    // Step 2: If item exists, update only the fields that are passed
    if (existingItem.Item) {
      const command = new UpdateCommand({
        TableName: 'user-settings',
        Key: { email },
        UpdateExpression: 'SET #settings = :settings, updatedAt = :updatedAt',
        ExpressionAttributeNames: {
          '#settings': 'settings'
        },
        ExpressionAttributeValues: {
          ':settings': cleanSettings,
          ':updatedAt': new Date().toISOString()
        }
      });

      // Execute the update command
      await docClient.send(command);
    } else {
      // If the item doesn't exist, create a new one using PutCommand
      const putCommand = new PutCommand({
        TableName: 'user-settings',
        Item: {
          email,
          settings: cleanSettings,
          updatedAt: new Date().toISOString()
        }
      });

      // Execute the put command
      await docClient.send(putCommand);
    }

    return true;
  } catch (error) {
    console.error('Error saving user settings:', error);
    throw error;
  }
};

export const updateUserCount = async (email, valueCount) => {
  try {
    // Step 1: Retrieve the current user settings item to check existing count and lastUpdate
    const getCommand = new GetCommand({
      TableName: 'user-settings',
      Key: { email }
    });

    const existingItem = await docClient.send(getCommand);

    // Step 2: If the user settings exist, handle the count logic
    if (existingItem.Item) {
      let { count } = existingItem.Item;

      // Step 3: Check if count exists, if not initialize it
      if (!count) {
        count = {
          limit: valueCount,
          lastUpdate: new Date().toISOString()
        };

        // Update the count field with the initialized values
        const updateCommand = new UpdateCommand({
          TableName: 'user-settings',
          Key: { email },
          UpdateExpression: 'SET #count = :count',
          ExpressionAttributeNames: {
            '#count': 'count'
          },
          ExpressionAttributeValues: {
            ':count': count
          }
        });

        await docClient.send(updateCommand);
        return true;
      }

      // Step 4: Calculate the time difference (in hours) from the lastUpdate
      const currentTime = new Date();
      let resetLimit = false;
      let lastUpdate = count.lastUpdate;

      if (count.lastUpdate) {
        const lastUpdateTime = new Date(count.lastUpdate);
        const timeDifference = (currentTime - lastUpdateTime) / (1000 * 3600); // Difference in hours

        if (timeDifference >= 24) {
          resetLimit = true;
          lastUpdate = currentTime.toISOString(); // Update the lastUpdate if 24 hours passed
        }
      } else {
        resetLimit = true;
        lastUpdate = currentTime.toISOString(); // Set the lastUpdate to current time
      }

      // Prepare the new count object
      const newCount = {
        limit: resetLimit ? valueCount : (count.limit || 0) + valueCount,
        lastUpdate: lastUpdate // Preserve the lastUpdate or update it as needed
      };

      // Step 5: Update the count field with new values
      const updateCommand = new UpdateCommand({
        TableName: 'user-settings',
        Key: { email },
        UpdateExpression: 'SET #count = :count',
        ExpressionAttributeNames: {
          '#count': 'count'
        },
        ExpressionAttributeValues: {
          ':count': newCount
        }
      });

      // Execute the update command
      await docClient.send(updateCommand);
      return true;
    } else {
      // If the user does not exist, do nothing and return false
      return false; // Indicate the user was not found
    }
  } catch (error) {
    console.error('Error updating user count:', error);
    throw error; // Rethrow the error for further handling
  }
};


export const getUserSettings = async (email) => {
  try {
    const command = new GetCommand({
      TableName: 'user-settings',
      Key: { email }
    });

    const response = await docClient.send(command);
    
    if (!response.Item) {
      // Don't automatically initialize here anymore
      // Just return null to indicate no settings exist
      return null;
    }

    return response.Item;
  } catch (error) {
    console.error('Error getting user settings:', error);
    throw error;
  }
};
require('dotenv').config();
const AWS = require('aws-sdk');


// Configure AWS SDK
AWS.config.update({
  region: 'us-east-2',
  accessKeyId: 'AKIA47GCAFFHQBTJSXXS',
  secretAccessKey: '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',
});

// Initialize CognitoIdentityServiceProvider
const cognito = new AWS.CognitoIdentityServiceProvider();

async function getAttributes(email) {
  const userPoolId = 'us-east-2_CXSPP8aex';

  const params = {
    UserPoolId: 'us-east-2_CXSPP8aex', // Your Cognito User Pool ID
    Username: email, // The email of the user
  };

  try {
    const response = await cognito.adminGetUser(params).promise();

    // Parse user attributes
    const attributes = response.UserAttributes.reduce((acc, attr) => {
      acc[attr.Name] = attr.Value;
      return acc;
    }, {});

    console.log('User Attributes:', attributes);
    return attributes;
  } catch (error) {
    console.error('Error fetching user attributes:', error);
    throw error;
  }
}

// Example usage
const email = 'durraniabdurehman@gmail.com'; // Replace with the user's email

getAttributes(email)
  .then((attributes) => {
    console.log('Fetched attributes:', attributes);
  })
  .catch((error) => {
    console.error('Failed to fetch attributes:', error);
  });

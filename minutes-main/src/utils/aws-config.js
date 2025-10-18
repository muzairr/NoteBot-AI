// utils/aws-config.js
export const awsConfig = {
    region: process.env.NEXT_PUBLIC_AWS_REGION,
    userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
    userPoolWebClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID
  };
  
  // Validate config on load
  if (!awsConfig.userPoolId || !awsConfig.userPoolWebClientId) {
    console.error('AWS Cognito credentials are not properly configured');
  }
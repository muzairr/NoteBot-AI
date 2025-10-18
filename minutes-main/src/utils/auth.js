// utils/auth.js
import { CognitoUserPool, CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';
import { getUserSettings, initializeUserSettings } from './user-settings';
import axios from 'axios';
import AWS from 'aws-sdk';

const poolConfig = {
  UserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
  ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID
};

AWS.config.update({
  region: 'us-east-2', // e.g., 'us-east-1',
  accessKeyId:process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
  secretAccessKey:process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID
});

const cognito = new AWS.CognitoIdentityServiceProvider();




const userPool = new CognitoUserPool(poolConfig);

export const validateOnboardingAnswers = (answers) => {
  if (!answers.isSLPProvider) {
    return false;
  }

  const correctActivities = [1, 2, 3, 5];
  const selectedActivities = answers.activities || [];

  return correctActivities.every(id => selectedActivities.includes(id)) &&
         selectedActivities.every(id => correctActivities.includes(id));
};

export const confirmSignUp = (email, code) => {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool
      });
  
      cognitoUser.confirmRegistration(code, true, (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      });
    });
};
  
export const resendConfirmationCode = (email) => {
  return new Promise((resolve, reject) => {
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool
    });

    cognitoUser.resendConfirmationCode((err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    });
  });
};

  export const signUp = (email, password, name,plan) => {
    console.log(plan)
    const promoExpiry = localStorage.getItem('promoExpiry')
    console.log(promoExpiry);
    const currentDate = new Date();
    const planDate=currentDate.toISOString();
    
    return new Promise((resolve, reject) => {
      const attributeList = [
        { Name: 'name', Value: name },
        { Name: 'email', Value: email },
        { Name: 'custom:plan', Value: plan },
        { Name: 'custom:planDate', Value: planDate },
      ];

      if (promoExpiry) {
        attributeList.push({ Name: 'custom:promoExpiry', Value: 'true' });
      }
  
      userPool.signUp(
        email,
        password,
        attributeList,
        null,
        async (err, result) => {
          if (err) {
            reject(err);
            return;
          }
  
          try {
            // Initialize user settings
            await initializeUserSettings(email);
  
            
            resolve({ 
              status: 'SUCCESS', 
              user: result.user 
            });
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  };

  export const login = async (email, password) => {
    return new Promise((resolve, reject) => {
      const authenticationDetails = new AuthenticationDetails({
        Username: email,
        Password: password,
      });
  
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool
      });
  
      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: async (result) => {
          const token = result.getAccessToken().getJwtToken();
          const refreshToken = result.getRefreshToken().getToken();
          
          localStorage.setItem('accessToken', token);
          localStorage.setItem('refreshToken', refreshToken);
  
          try {
            // Check if user has completed first-time settings
            const userSettings = await getUserSettings(email);
            
            resolve({ 
              token, 
              refreshToken, 
              isFirstTimeLogin: userSettings?.firstTimeLogin ?? true 
            });
          } catch (error) {
            // If there's an error getting settings, assume it's first time
            resolve({ 
              token, 
              refreshToken, 
              isFirstTimeLogin: true 
            });
          }
        },
        onFailure: (err) => {
          reject(err);
        }
      });
    });
  };

export const forgotPassword = (email) => {
  return new Promise((resolve, reject) => {
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool
    });

    cognitoUser.forgotPassword({
      onSuccess: () => {
        resolve();
      },
      onFailure: (err) => {
        reject(err);
      }
    });
  });
};

export const confirmPassword = (email, code, newPassword) => {
  return new Promise((resolve, reject) => {
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool
    });

    cognitoUser.confirmPassword(code, newPassword, {
      onSuccess: () => {
        resolve();
      },
      onFailure: (err) => {
        reject(err);
      }
    });
  });
};

export const logout = () => {
  const cognitoUser = userPool.getCurrentUser();
  if (cognitoUser) {
    cognitoUser.signOut();
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
};

export const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const cognitoUser = userPool.getCurrentUser();
    
    if (!cognitoUser) {
      reject(new Error('No user found'));
      return;
    }

    cognitoUser.getSession((err, session) => {
      if (err) {
        reject(err);
        return;
      }

      cognitoUser.getUserAttributes((err, attributes) => {
        if (err) {
          reject(err);
          return;
        }

        const userInfo = attributes.reduce((acc, attr) => {
          acc[attr.Name] = attr.Value;
          return acc;
        }, {});

        resolve(userInfo);
      });
    });
  });
};

export const updateUser = async ({ selectedPlan, children,planDate,promoExpiry }) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Get the current user
      const cognitoUser = userPool.getCurrentUser();
      if (!cognitoUser) {
        console.error('Error: No current user found.');
        reject(new Error('User is not authenticated.'));
        return;
      }

      // Refresh session if needed
      cognitoUser.getSession(async (err, session) => {
        if (err) {
          console.error('Error fetching Cognito session:', err.message);
          reject(new Error('Cognito session is invalid or expired.'));
          return;
        }

        if (!session.isValid()) {
          console.error('Error: Cognito session is not valid.');
          reject(new Error('Cognito session is invalid or expired.'));
          return;
        }

        // Prepare attributes to update
        const attributes = [];

        // Add custom:plan if selectedPlan is passed
        if (selectedPlan) {
          attributes.push({
            Name: 'custom:plan',
            Value: selectedPlan,
          });
        }
        if (children) {
          attributes.push({
            Name: 'custom:child',
            Value: children,
          });
        }
        if (planDate) {
          attributes.push({
            Name: 'custom:planDate',
            Value: planDate,
          });
        }
        if (promoExpiry) {
          attributes.push({
            Name: 'custom:promoExpiry',
            Value: promoExpiry,
          });
        }

        // If no attributes to update, resolve early
        if (attributes.length === 0) {
          console.error('Error: No attributes provided for update.');
          reject(new Error('No attributes provided for update.'));
          return;
        }

        // Update the user's attributes
        cognitoUser.updateAttributes(attributes, (updateErr) => {
          if (updateErr) {
            console.error('Error updating Cognito user attributes:', updateErr.message);
            reject(updateErr);
          } else {
            console.log('Successfully updated Cognito user attributes.');
            localStorage.removeItem('checkoutSessionId');
            resolve({ status: 'SUCCESS' });
          }
        });
      });
    } catch (error) {
      console.error('Unexpected error:', error.message);
      reject(error);
    }
  });
};


export const checkForPlan = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await getCurrentUser(); // Fetch the current user

      // If email exists and plan does NOT exist, resolve true
      if (user?.email && (!user?.['custom:plan'] || user?.['custom:parent'])) {
        console.log('User has an email but no plan. Returning false.');
        return resolve(false);
      }
      // If user.plan exists, check the payment status
      const { data } = await axios.get(`https://test-api.slpeace.com/active-subscriptions?email=${user.email}&sub=${user.sub}`);
      if (data.paid==false && (user?.['custom:plan'] === 'free' || user?.['custom:plan'] === 'team-member')) {
        if(user?.['custom:plan'] === 'team-member'){
          if (user?.['custom:promoExpiry'] === 'true') {
            const planDateStr = user?.['custom:planDate'];
            // Check if planDate exists and is a valid date
            if (!planDateStr) {
              const currentDate = new Date();
              const planDate=currentDate.toISOString();
              updateUser({planDate})
              return resolve(true); // Invalid or missing planDate
            }
        
            const planDate = new Date(planDateStr);
            const currentDate = new Date();
            
            // Calculate the difference in days
            const diffTime = currentDate - planDate;
            const diffDays = diffTime / (1000 * 60 * 60 * 24);
        
            if (diffDays > 90) {
                return resolve(false);
            } else {
                return resolve(true);
            }
        }        
          else{
          return resolve(true);
        } 
        }
        const currentDate = new Date();
        
        if (user?.['custom:planDate']) {
          const planDate = new Date(user['custom:planDate']);
          const daysDifference = Math.floor((currentDate - planDate) / (1000 * 60 * 60 * 24));
          
          if (daysDifference > 3) {
            return resolve(false); // More than 3 days have passed
          } else {
            return resolve(true); // Less than or equal to 3 days
          }
        } else {
          const planDate=currentDate.toISOString();
          updateUser({planDate})
          return resolve(true);
        }
      }
      
      console.log('Payment status:', data.paid);
      resolve(data.paid);
    } catch (error) {
      console.error('Unexpected error:', error.message);
      reject(error);
    }
  });
};

export const createAccount = async (email, password, name, plan) => {
  const userEmail = await getCurrentUser();
  return new Promise((resolve, reject) => {
    const attributeList = [
      { Name: 'email', Value: email },
      { Name: 'name', Value: name },
      { Name: 'custom:plan', Value: plan },
      { Name: 'custom:parent', Value: userEmail.email },
    ];

    userPool.signUp(email, password, attributeList, null, (err, result) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(result.user);
    });
  });
};

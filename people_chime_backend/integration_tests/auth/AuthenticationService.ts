import { type CognitoUser } from '@aws-amplify/auth';
import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-providers';
import { Amplify, Auth } from 'aws-amplify';

const awsRegion = 'us-east-1'

Amplify.configure({
    Auth: {
        region: awsRegion,
        userPoolId: 'us-east-1_8gn26Gz7U',
        userPoolWebClientId: 'dfpd52lv2pld1hlv60ogh5htv',
        authenticationFlowType: 'USER_PASSWORD_AUTH'
    }
});



export class AuthenticationService {

    public async login(userName: string, password: string) {
        console.log("Attempting to login");
        const result = await Auth.signIn(userName, password) as CognitoUser;
        console.log("SignIn successful. CognitoUser is: [" + JSON.stringify(result) + "]");
        return result;
    }

    public async generateTemporaryCredentials(user: CognitoUser) {
        console.log("Attempting to find the temporary credentials");
        const jwtToken = user.getSignInUserSession().getIdToken().getJwtToken();
        console.log("jtwToken is: " + jwtToken);
        const cognitoIdentityPool = `cognito-idp.${awsRegion}.amazonaws.com/ap-south-1_UfZrG30p0`;
        const cognitoIdentity = new CognitoIdentityClient({
            credentials: fromCognitoIdentityPool({
                identityPoolId: 'ap-south-1:7b4885cd-88cd-4a3a-a172-3b48b5a4b810',
                logins: {
                    [cognitoIdentityPool]: jwtToken
                }
            })
        });
        console.log("Attempting to get the credentials");
        const credentials = await cognitoIdentity.config.credentials();
        console.log("Credentials are: " + JSON.stringify(credentials))
        return credentials;
    }
}
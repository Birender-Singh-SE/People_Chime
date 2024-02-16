import { Stack, StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { Runtime } from 'aws-cdk-lib/aws-lambda'
import { AuthorizationType, CognitoUserPoolsAuthorizer, Cors, LambdaIntegration, MethodOptions, ResourceOptions, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { IUserPool } from 'aws-cdk-lib/aws-cognito';

interface ApiStackProps extends StackProps {
    resumeReviewRequestHandlerLambdaIntegration: LambdaIntegration,
    userPool: IUserPool
}

export class ApiStack extends Stack {

    constructor(scope: Construct, id: string, props: ApiStackProps) {
        super(scope, id, props)
        const api = new RestApi(this, 'PeopleChimeApi')

        //create authorizor construct
        //specify where the authorizer information will be available from
        const authorizer = new CognitoUserPoolsAuthorizer(this, 'PeopleChimeAuthorizer', {
            cognitoUserPools: [props.userPool],
            identitySource: 'method.request.header.Authorization'
        });
        //attach the authorizer to the api
        authorizer._attachToApi(api);

        //Create the auth object
        const optionsWithAuth: MethodOptions = {
            authorizationType: AuthorizationType.COGNITO,
            authorizer: {
                authorizerId: authorizer.authorizerId
            }
        }

        const optionsWithCors: ResourceOptions = {
            defaultCorsPreflightOptions: {
                allowOrigins: Cors.ALL_ORIGINS,
                allowMethods: Cors.ALL_METHODS
            }
        }

        const resumeReviewRequestResource = api.root.addResource('resume-review-requests', optionsWithCors)
        //attach the authorizer to method
        resumeReviewRequestResource.addMethod('GET', props.resumeReviewRequestHandlerLambdaIntegration, optionsWithAuth);
        resumeReviewRequestResource.addMethod('POST', props.resumeReviewRequestHandlerLambdaIntegration, optionsWithAuth);

    }
}
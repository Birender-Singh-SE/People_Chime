import { App } from "aws-cdk-lib";
import { DataStack } from "./stacks/DataStack";
import { LambdaStack } from "./stacks/LambdaStack";
import { ApiStack } from "./stacks/ApiStack";
import { AuthStack } from "./stacks/AuthStack";
import { UiDeploymentStack } from "./stacks/UiDeploymentStack";



const app = new App;
const dataStack = new DataStack(app, 'DataStack');
const lambdaStack = new LambdaStack(app, 'LambdaStack', {
    resumeReviewRequestTable: dataStack.resumeReviewRequestTable
});

const authStack = new AuthStack(app, 'AuthStack',
    {
        photosBucket: dataStack.resumeBucket
    }
);

new ApiStack(app, 'ApiStack', {
    resumeReviewRequestHandlerLambdaIntegration: lambdaStack.resumeReviewRequestHandlerLambdaIntegration,
    userPool: authStack.userPool
});

new UiDeploymentStack(app, 'UiDeploymentStack')
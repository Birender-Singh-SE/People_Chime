import { Stack, StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { Code, Runtime } from 'aws-cdk-lib/aws-lambda'
import { join } from 'path'
import { LambdaIntegration } from 'aws-cdk-lib/aws-apigateway'
import { ITable } from 'aws-cdk-lib/aws-dynamodb'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam'

interface LambdaStackProps extends StackProps {
    resumeReviewRequestTable: ITable
}


export class LambdaStack extends Stack {
    public readonly resumeReviewRequestHandlerLambdaIntegration: LambdaIntegration

    constructor(scope: Construct, id: string, props: LambdaStackProps) {
        super(scope, id, props)

        const resumeReviewRequestHandlerLambda = new NodejsFunction(this, 'ResumeReviewRequestLambda', {
            runtime: Runtime.NODEJS_18_X,
            handler: 'handler',
            entry: join(__dirname, '..', '..', 'services', 'ResumeReviewRequestHandler.ts'),
            environment: {
                TABLE_NAME: props.resumeReviewRequestTable.tableName
            }
        })
        this.resumeReviewRequestHandlerLambdaIntegration = new LambdaIntegration(resumeReviewRequestHandlerLambda);
        resumeReviewRequestHandlerLambda.addToRolePolicy(
            new PolicyStatement({
                effect: Effect.ALLOW,
                resources: [props.resumeReviewRequestTable.tableArn, props.resumeReviewRequestTable.tableArn + '/*'],
                actions: [
                    'dynamodb:PutItem',
                    'dynamodb:GetItem',
                    "dynamodb:Query",
                    "dynamodb:Scan",
                ]

            }))
    }
}
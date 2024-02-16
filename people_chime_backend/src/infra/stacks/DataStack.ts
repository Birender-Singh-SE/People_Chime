import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib'
import { AttributeType, ITable, Table } from 'aws-cdk-lib/aws-dynamodb'
import { Construct } from 'constructs'
import { getSuffixFromStack } from '../Utils';
import { Bucket, BucketAccessControl, HttpMethods, IBucket, ObjectOwnership } from 'aws-cdk-lib/aws-s3';




export class DataStack extends Stack {

    public readonly resumeReviewRequestTable: ITable;
    public readonly resumeBucket: IBucket;


    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props)
        const suffix = getSuffixFromStack(this);
        const resumeReviewTableUserIdIndexName = 'userId-index-v2'

        this.resumeReviewRequestTable = new Table(this, 'ResumeReviewRequestTable', {
            partitionKey: {
                name: 'id',
                type: AttributeType.STRING
            },

            tableName: `ResumeReviewRequest-${suffix}`
        });

        (this.resumeReviewRequestTable as Table).addGlobalSecondaryIndex({
            indexName: resumeReviewTableUserIdIndexName,
            partitionKey: {
                name: 'userId',
                type: AttributeType.STRING,
            }
        });

        this.resumeBucket = new Bucket(this, 'ReviewRequestResumes', {
            bucketName: `review-request-resumes-${suffix}`,
            cors: [{
                allowedMethods: [
                    HttpMethods.HEAD,
                    HttpMethods.GET,
                    HttpMethods.PUT
                ],
                allowedOrigins: ['*'], //TODO: Secure through this.
                allowedHeaders: ['*']
            }],
            //accessControl: BucketAccessControl.PUBLIC_READ, // currently not working,
            objectOwnership: ObjectOwnership.OBJECT_WRITER,
            blockPublicAccess: { //TODO: Secure this
                blockPublicAcls: false,
                blockPublicPolicy: false,
                ignorePublicAcls: false,
                restrictPublicBuckets: false
            }
        });
        new CfnOutput(this, 'ReviewRequestResumeBucketName', {
            value: this.resumeBucket.bucketName
        });

        new CfnOutput(this, 'ResumeReviewRequestTableUserIdIndexName', {
            value: resumeReviewTableUserIdIndexName
        });


    }
}
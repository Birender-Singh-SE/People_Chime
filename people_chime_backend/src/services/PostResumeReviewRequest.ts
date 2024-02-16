import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { v4 } from "uuid";
import { validateResumeReviewRequest } from "./validators/ResumeReviewRequestValidator";
import { validatePostReviewRequestAuthorization } from "./validators/PostResumeReviewRequestAuthValidator";

export async function postResumeRequests(event: APIGatewayProxyEvent, ddbClient: DynamoDBClient): Promise<APIGatewayProxyResult> {
    console.log("Post has been updated to handle update and create request");
    validatePostReviewRequestAuthorization(event);
    console.log("requestContext:" + JSON.stringify(event.requestContext));
    const item = JSON.parse((event as any).body);

    if (item.id == null) {
        console.log("New item POST request");
        item.id = v4();
    }

    if (item.userId == null) {
        item.userId = event.requestContext.authorizer.claims['sub'];
    }

    if (item.username == null) {
        item.username = event.requestContext.authorizer.claims['cognito:username'];
    }

    console.log("item persisting is: " + JSON.stringify(item))
    validateResumeReviewRequest(item)

    const result = await ddbClient.send(new PutItemCommand({
        TableName: process.env.TABLE_NAME,
        Item: marshall(item)
    }));
    console.log(result);

    return {
        statusCode: 201,
        body: JSON.stringify({ id: item.id })
    }
}
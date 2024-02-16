import { DynamoDBClient, GetItemCommand, ScanCommand, QueryCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";



export async function getResumeRequests(event: APIGatewayProxyEvent, ddbClient: DynamoDBClient): Promise<APIGatewayProxyResult> {
    console.log("Received a GET request");

    if (event.queryStringParameters) {
        if ('id' in event.queryStringParameters) {
            console.log("Found id in the queryStringParam");
            const reviewRequestId = event.queryStringParameters['id'];
            const getItemResponse = await ddbClient.send(new GetItemCommand({
                TableName: process.env.TABLE_NAME,
                Key: {
                    'id': { S: reviewRequestId } as any
                }
            }))
            if (getItemResponse.Item) {
                return {
                    statusCode: 200,
                    body: JSON.stringify(unmarshall(getItemResponse.Item))
                }
            } else {
                return {
                    statusCode: 404,
                    body: JSON.stringify(`ReviewRequest with id ${reviewRequestId} not found!`)
                }
            }
        } else if ('query' in event.queryStringParameters) {
            console.log("Found query in the queryStringParam");
            const userId = event.requestContext.authorizer.claims['sub'];
            console.log("userId identified is: " + userId);
            const queryResponse = await ddbClient.send(new QueryCommand({
                KeyConditionExpression: "userId = :v",
                ExpressionAttributeValues: {
                    ":v": { S: userId }
                },
                TableName: process.env.TABLE_NAME,
                IndexName: 'userId-index-v2'
            }))
            console.log("queryResponse: " + JSON.stringify(queryResponse));
            if (queryResponse.Items && queryResponse.Items.length > 0) {

                const marshalledItems = queryResponse.Items.map((item) => {
                    return unmarshall(item);
                });

                return {
                    statusCode: 200,
                    body: JSON.stringify(marshalledItems)
                }
            } else {
                return {
                    statusCode: 404,
                    body: JSON.stringify(`ReviewRequest with  not found!`)
                }
            }

        } else {
            console.log("No query params");
            return {
                statusCode: 400,
                body: JSON.stringify('Id required!')
            }
        }
    }

    const result = await ddbClient.send(new ScanCommand({
        TableName: process.env.TABLE_NAME,
    }));
    console.log(result.Items);

    return {
        statusCode: 201,
        body: JSON.stringify(result.Items)
    }
}
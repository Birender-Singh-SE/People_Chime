import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { postResumeRequests } from "./PostResumeReviewRequest";
import { getResumeRequests } from "./GetResumeReviewRequest";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { MissingFieldError } from "./validators/ResumeReviewRequestValidator";
import { AuthorizationFailureError } from "./validators/PostResumeReviewRequestAuthValidator";


async function handler(event: APIGatewayProxyEvent, context: Context) {
    console.log('event is: ' + JSON.stringify(event))
    let response: APIGatewayProxyResult;
    let statusCode: number = 200;

    const ddbClient = new DynamoDBClient({});

    try {
        switch (event.httpMethod) {
            case 'GET':
                response = await getResumeRequests(event, ddbClient)
                break;
            case 'POST':
                response = await postResumeRequests(event, ddbClient)
                break;
            default:
                break;
        }
    } catch (error) {
        console.error(error)

        if (error instanceof MissingFieldError) {

            response = {
                statusCode: 400,
                body: JSON.stringify(error.message)
            }
        }
        if (error instanceof AuthorizationFailureError) {

            response = {
                statusCode: 401,
                body: JSON.stringify(error.message)
            }
        }
        else {
            response = {
                statusCode: 500,
                body: JSON.stringify(error.message)
            }

        }
    }

    addCorsHeader(response)
    return response

}



function addCorsHeader(arg: APIGatewayProxyResult) {
    if (!arg.headers) {
        arg.headers = {}
    }
    arg.headers['Access-Control-Allow-Origin'] = '*';
    arg.headers['Access-Control-Allow-Methods'] = '*';
    console.log('Adding CORS headers');
}

export { handler }
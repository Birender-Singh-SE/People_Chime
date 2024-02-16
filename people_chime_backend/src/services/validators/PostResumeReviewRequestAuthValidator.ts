import { APIGatewayProxyEvent } from "aws-lambda"
import { ResumeReviewRequest } from "../model/Model"
import { eventNames } from "process"

export class AuthorizationFailureError extends Error {
    constructor() {
        super(`User not authorized for this action`)
    }
}

export function validatePostReviewRequestAuthorization(event: APIGatewayProxyEvent) {
    const groups = event.requestContext.authorizer?.claims['cognito:groups'];

    if (!groups || !(groups as string).includes('admins')) //if check invoker belongs to the admin group
    {
        throw new AuthorizationFailureError();
    }
}
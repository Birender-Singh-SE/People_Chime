import { handler } from "../src/services/ResumeReviewRequestHandler";


handler({
    httpMethod: 'GET',
    queryStringParameters: JSON.stringify({
        id: '47e49af9-0dd7-4f98-aa2f-23c51aca98c9'
    }),
    multiValueQueryStringParameter: JSON.stringify({
        "id": [
            "47e49af9-0dd7-4f98-aa2f-23c51aca98c9"
        ]
    })
} as any, {} as any);
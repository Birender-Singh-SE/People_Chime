import { handler } from "../src/services/ResumeReviewRequestHandler";


handler({
    httpMethod: 'POST',
    body: JSON.stringify({
        location: 'Dublin'
    })
} as any, {} as any);
import { ResumeReviewRequest } from "../model/Model"

export class MissingFieldError extends Error {
    constructor(missingField: string) {
        super(`Value for ${missingField} expected!`)
    }
}

export function validateResumeReviewRequest(arg: any) {
    if ((arg as ResumeReviewRequest).docUrl == undefined) {
        throw new MissingFieldError('docUrl')
    }
}
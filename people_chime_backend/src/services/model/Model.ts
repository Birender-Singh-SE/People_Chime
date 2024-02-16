export interface ResumeReviewRequest {
    id: string,
    name: string,
    docUrl: string,
    reviewedDocUrl: string,
    requesterNotes: string,
    reviewerNotes: string,
    userId: string,
    username: string
}
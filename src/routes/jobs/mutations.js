import gql from "graphql-tag";

export const CANCEL_JOBS = gql`
	mutation CancelJobs($input: CancelJobsInput!) {
		cancelJobs(input: $input) {
				id
				name
				createdOn
				updatedOn
				status
				kind
				startedOn
				completedOn
				file
		}
	}
`;

export const RETRY_JOBS = gql`
	mutation RetryJobs($input: RetryJobsInput!) {
		retryJobs(input: $input) {
				id
				name
				createdOn
				updatedOn
				status
				kind
				startedOn
				completedOn
				file
		}
	}
`;

export const PAUSE_JOBS = gql`
	mutation PauseJobs($input: PauseJobsInput!) {
		pauseJobs(input: $input) {
				id
				name
				createdOn
				updatedOn
				status
				kind
				startedOn
				completedOn
				file
		}
	}
`;

export const RESUME_JOBS = gql`
	mutation ResumeJobs($input: ResumeJobsInput!) {
		resumeJobs(input: $input) {
				id
				name
				createdOn
				updatedOn
				status
				kind
				startedOn
				completedOn
				file
		}
	}
`;
export const ARCHIVE_JOBS = gql`
	mutation ArchiveJobs($input: ArchiveJobsInput!) {
		archiveJobs(input: $input) {
				id
				name
				createdOn
				updatedOn
				status
				kind
				startedOn
				completedOn
				file
		}
	}
`;

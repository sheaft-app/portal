import gql from "graphql-tag";

export const CANCEL_JOBS = gql`
	mutation CancelJobs($input: IdsWithReasonInput!) {
		cancelJobs(input: $input) {
			nodes {
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
	}
`;

export const RETRY_JOBS = gql`
	mutation RetryJobs($input: IdsInput!) {
		retryJobs(input: $input) {
			nodes {
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
	}
`;

export const PAUSE_JOBS = gql`
	mutation PauseJobs($input: IdsInput!) {
		pauseJobs(input: $input) {
			nodes {
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
	}
`;

export const RESUME_JOBS = gql`
	mutation ResumeJobs($input: IdsInput!) {
		resumeJobs(input: $input) {
			nodes {
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
	}
`;
export const ARCHIVE_JOBS = gql`
	mutation ArchiveJobs($input: IdsInput!) {
		archiveJobs(input: $input) {
			nodes {
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
	}
`;

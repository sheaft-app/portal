import gql from "graphql-tag";

export const CANCEL_JOBS = gql`
	mutation CancelJobs($input: ResourceIdsWithReasonInput!) {
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
	mutation RetryJobs($input: ResourceIdsInput!) {
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
	mutation PauseJobs($input: ResourceIdsInput!) {
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
	mutation ResumeJobs($input: ResourceIdsInput!) {
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
	mutation ArchiveJobs($input: ResourceIdsInput!) {
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

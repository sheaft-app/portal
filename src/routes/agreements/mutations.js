import gql from "graphql-tag";

export const CANCEL_AGREEMENTS = gql`
	mutation cancelAgreements($input: CancelAgreementsInput!) {
		cancelAgreements(input: $input) {
			id
			status
		}
	}
`;

export const ACCEPT_AGREEMENTS = gql`
	mutation acceptAgreements($input: AcceptAgreementsInput!) {
		acceptAgreements(input: $input) {
			id
			status
		}
	}
`;

export const REFUSE_AGREEMENTS = gql`
	mutation refuseAgreements($input: RefuseAgreementsInput!) {
		refuseAgreements(input: $input) {
			id
			status
		}
	}
`;

export const UPDATE_AGREEMENT_DELIVERY = gql`
	mutation updateAgreementDelivery($input: ChangeAgreementDeliveryInput!) {
		changeAgreementDelivery(input: $input) {
			id
			status
		}
	}
`;

export const UPDATE_AGREEMENT_CATALOG = gql`
	mutation updateAgreementCatalog($input: ChangeAgreementCatalogInput!) {
		changeAgreementCatalog(input: $input) {
			id
			status
		}
	}
`;

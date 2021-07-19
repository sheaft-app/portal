import gql from "graphql-tag";

export const EXPORT_ACCOUTING = gql`
	mutation ExportAccounting($input: ExportAccountingInput) {
		exportAccounting(input: $input) {
			id
		}
	}
`;

export const MARK_DELIVERIES_AS_BILLED = gql`
	mutation MarkAsBilled($input: MarkDeliveriesAsBilledInput) {
		markDeliveriesAsBilled(input: $input) {
			id
		}
	}
`;

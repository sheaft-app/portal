import gql from "graphql-tag";

export const EXPORT_TIMERANGED_BILLINGS = gql`
	mutation ExportTimeRangedBillings($input: QueueExportTimeRangedBillingsInput) {
		exportTimeRangedBillings(input: $input) {
			id
		}
	}
`;
export const EXPORT_BILLINGS = gql`
	mutation ExportBillings($input: QueueExportBillingsInput) {
		exportBillings(input: $input) {
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

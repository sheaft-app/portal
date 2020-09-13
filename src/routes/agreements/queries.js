import gql from "graphql-tag";

export const GET_AGREEMENTS = gql`
	query GetAgreements {
		agreements {
			nodes {
				id
				status
				createdOn
				store {
					id
					name
				}
				delivery {
					producer {
						id
						name
					}
				}
			}
		}
	}
`;

export const GET_PRODUCER_PRODUCTS = gql`
	query GetProducerProducts($companyId: ID!) {
		producerProducts(input: $companyId) {
			id
			name
			wholeSalePricePerUnit
			wholeSalePrice
			rating
			quantityPerUnit
			unit
			conditioning
			weight
			producer {
				id
			}
		}
	}
`;

export const GET_AGREEMENT_DETAILS = gql`
	query GetAgreement($id: ID!) {
		agreement(input: $id) {
			id
			status
			createdOn
			selectedHours {
				day
				from
				to
			}
			store {
				id
				name
				address {
					line1
					line2
					city
					zipcode
				}
				phone
				email
			}
			delivery {
				producer {
					id
					name
					address {
						line1
						line2
						city
						zipcode
					}
					phone
					email
				}
			}
		}
	}
`;

import gql from "graphql-tag";

export const DELETE_DELIVERY_BATCH = null;

export const CREATE_DELIVERY_BATCH = gql`
    mutation CreateDeliveryBatch($input: CreateDeliveryBatchInput) {
        createDeliveryBatch(input: $input) {
            id
        }
    }
`;

export const UPDATE_DELIVERY_BATCH = gql`
    mutation UpdateDeliveryBatch($input: UpdateDeliveryBatchInput) {
        updateDeliveryBatch(input: $input) {
            id
        }
    }
`;
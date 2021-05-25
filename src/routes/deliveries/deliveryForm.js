import DeliveryKind from "../../enums/DeliveryKind.js";
import { getDefaultFields } from "../../stores/form";
import omit from "lodash/omit";
import {
    normalizeOpeningHours,
    normalizeClosingDates
} from "./../../helpers/app";

export const initialValues = {
    name: "",
    kind: DeliveryKind.ProducerToStore.Value,
    maxPurchaseOrdersPerTimeSlot: null,
    autoAcceptRelatedPurchaseOrder: false,
    limitOrders: false,
    autoCompleteRelatedPurchaseOrder: false,
    deliveryHours: [
        {
            id: 0,
            days: [],
            from: null,
            to: null
        }
    ],
    lockOrderHoursBeforeDelivery: 0,
    denormalizedDeliveryHours: [],
    denormalizedClosings: [],
    available: true
};

export const validators = (delivery) => ({
    ...getDefaultFields(delivery, initialValues, ['maxPurchaseOrdersPerTimeSlot', 'deliveryHours', 'lockOrderHoursBeforeDelivery', 'denormalizedClosings']),
    denormalizedDeliveryHours: { value: delivery.denormalizedDeliveryHours, validators: ["required", "openingsDays", "openingsDates"], enabled: true },
    maxPurchaseOrders: { value: delivery.maxPurchaseOrdersPerTimeSlot, validators: ["min:1"], enabled: delivery.limitOrders },
    lockPurchaseOrders: { value: delivery.lockOrderHoursBeforeDelivery, validators: ["min:0"], enabled: delivery.limitOrders },
    name: { value: delivery.name, validators: ["required", "min:3"], enabled: true }
});


export const normalizeDelivery = delivery => omit({
    ...delivery,
    deliveryHours: normalizeOpeningHours(delivery.denormalizedDeliveryHours),
    closings: normalizeClosingDates(delivery.denormalizedClosings),
    lockOrderHoursBeforeDelivery: delivery.limitOrders ? delivery.lockOrderHoursBeforeDelivery : null
  }, ['denormalizedDeliveryHours', 'denormalizedClosings', 'limitOrders']);
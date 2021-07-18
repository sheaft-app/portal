import DeliveryKind from "../../enums/DeliveryKind.js";
import { getDefaultFields } from "../../stores/form";
import omit from "lodash/omit";
import {
	normalizeOpeningHours,
	normalizeClosingDates,
	denormalizeClosingDates,
	denormalizeOpeningHours,
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
			to: null,
		},
	],
	closings: [],
	lockOrderHoursBeforeDelivery: null,
	denormalizedDeliveryHours: [],
	denormalizedClosings: [],
	agreements: [],
	available: true,
};

export const validators = (delivery) => ({
	...getDefaultFields(delivery, initialValues, [
		"maxPurchaseOrdersPerTimeSlot",
		"deliveryHours",
		"lockOrderHoursBeforeDelivery",
		"closings",
		"denormalizedClosings",
		"agreements",
	]),
	openings: {
		value: delivery.denormalizedDeliveryHours,
		validators: ["required", "openingsDays", "openingsDates"],
		enabled: true,
	},
	maxPurchaseOrders: {
		value: delivery.maxPurchaseOrdersPerTimeSlot,
		validators: ["min:1"],
		enabled: delivery.limitOrders,
	},
	lockPurchaseOrders: {
		value: delivery.lockOrderHoursBeforeDelivery,
		validators: ["min:0"],
		enabled: delivery.limitOrders,
	},
	name: { value: delivery.name, validators: ["required", "minLength:3"], enabled: true },
});

export const denormalizeDelivery = (delivery) => ({
	...delivery,
	agreements:
		delivery.agreements && delivery.agreements.length
			? delivery.agreements
					.sort((a, b) => (a.position >= b.position ? 1 : -1))
					.map((a) => ({ ...a.store, agreementId: a.id }))
			: [],
	denormalizedDeliveryHours: denormalizeOpeningHours(delivery.deliveryHours),
	denormalizedClosings: denormalizeClosingDates(delivery.closings),
	limitOrders: delivery.lockOrderHoursBeforeDelivery != null || delivery.maxPurchaseOrdersPerTimeSlot != null,
});

export const normalizeDelivery = (delivery) =>
	omit(
		{
			...delivery,
			deliveryHours: normalizeOpeningHours(delivery.denormalizedDeliveryHours),
			closings: normalizeClosingDates(delivery.denormalizedClosings),
			agreements: delivery.agreements.map((store, position) => ({ id: store.agreementId, position })),
			lockOrderHoursBeforeDelivery: delivery.limitOrders ? delivery.lockOrderHoursBeforeDelivery : null,
			maxPurchaseOrdersPerTimeSlot: delivery.limitOrders ? delivery.maxPurchaseOrdersPerTimeSlot : null,
		},
		["denormalizedDeliveryHours", "denormalizedClosings", "limitOrders"]
	);

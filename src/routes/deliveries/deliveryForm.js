import omit from "lodash/omit";

import DeliveryKind from "../../enums/DeliveryKind.js";
import {
	normalizeOpeningHours,
	normalizeClosingDates,
	denormalizeClosingDates,
	denormalizeOpeningHours,
} from "./../../helpers/app";
import { getDefaultFields } from "../../stores/form";
	import DeliveryFeesApplication from "../../enums/DeliveryFeesApplication";

export const initialValues = {
	name: "",
	kind: DeliveryKind.ProducerToStore.Value,
	maxPurchaseOrdersPerTimeSlot: null,
	autoAcceptRelatedPurchaseOrder: false,
	limitOrdersBefore: false,
	limitOrdersCount: false,
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
	applyDeliveryFeesWhen: null,
	deliveryFeesWholeSalePrice: null,
	deliveryFeesMinPurchaseOrdersAmount: null,
};

export const validators = (delivery) => ({
	...getDefaultFields(delivery, initialValues, [
		"maxPurchaseOrdersPerTimeSlot",
		"deliveryHours",
		"lockOrderHoursBeforeDelivery",
		"closings",
		"denormalizedClosings",
		"agreements",
		"deliveryFeesMinPurchaseOrdersAmount",
		"deliveryFeesWholeSalePrice",
		"applyDeliveryFeesWhen",
	]),
	openings: {
		value: delivery.denormalizedDeliveryHours,
		validators: ["required", "openingsDays", "openingsDates"],
		enabled: true,
	},
	maxPurchaseOrders: {
		value: delivery.maxPurchaseOrdersPerTimeSlot,
		validators: ["min:1"],
		enabled: delivery.limitOrdersCount,
	},
	lockPurchaseOrders: {
		value: delivery.lockOrderHoursBeforeDelivery,
		validators: ["min:1"],
		enabled: delivery.limitOrdersBefore,
	},
	refusePurchaseOrders: {
		value: delivery.acceptPurchaseOrdersWithAmountGreaterThan,
		validators: ["min:1"],
		enabled: delivery.limitOrdersAmount,
	},
	deliveryFeesMinAmount: {
		value: delivery.deliveryFeesMinPurchaseOrdersAmount,
		validators: ["min:1"],
		enabled: delivery.applyDeliveryFeesWhen == DeliveryFeesApplication.TotalLowerThanPurchaseOrderAmount.Value,
	},
	deliveryFees: {
		value: delivery.deliveryFeesWholeSalePrice,
		validators: ["min:1"],
		enabled: delivery.applyDeliveryFees,
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
	limitOrdersBefore: delivery.lockOrderHoursBeforeDelivery != null,
	limitOrdersCount: delivery.maxPurchaseOrdersPerTimeSlot != null,
	limitOrdersAmount: delivery.acceptPurchaseOrdersWithAmountGreaterThan != null,
	applyDeliveryFees: delivery.deliveryFeesWholeSalePrice != null,
});

export const normalizeDelivery = (delivery) =>
	omit(
		{
			...delivery,
			deliveryHours: normalizeOpeningHours(delivery.denormalizedDeliveryHours),
			closings: normalizeClosingDates(delivery.denormalizedClosings),
			agreements: delivery.agreements.map((store, position) => ({ id: store.agreementId, position })),
			lockOrderHoursBeforeDelivery: delivery.limitOrdersBefore ? delivery.lockOrderHoursBeforeDelivery : null,
			maxPurchaseOrdersPerTimeSlot: delivery.limitOrdersCount ? delivery.maxPurchaseOrdersPerTimeSlot : null,
			deliveryFeesMinPurchaseOrdersAmount:
				delivery.applyDeliveryFeesWhen == DeliveryFeesApplication.TotalLowerThanPurchaseOrderAmount.Value
					? delivery.deliveryFeesMinPurchaseOrdersAmount
					: null,
			deliveryFeesWholeSalePrice: delivery.applyDeliveryFees ? delivery.deliveryFeesWholeSalePrice : null,
			acceptPurchaseOrdersWithAmountGreaterThan: delivery.limitOrdersAmount
				? delivery.acceptPurchaseOrdersWithAmountGreaterThan
				: null,
		},
		[
			"denormalizedDeliveryHours",
			"denormalizedClosings",
			"limitOrdersCount",
			"limitOrdersBefore",
			"limitOrdersAmount",
			"applyDeliveryFees",
		]
	);

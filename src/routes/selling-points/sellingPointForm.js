import omit from "lodash/omit";

import { normalizeOpeningHours, normalizeClosingDates } from "./../../helpers/app";
import { getDefaultFields } from "../../stores/form";

export const initialValues = {
	name: "",
	kind: "",
	address: null,
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
	available: true,
};

export const validators = (values) => ({
	...getDefaultFields(values, initialValues, [
		"maxPurchaseOrdersPerTimeSlot",
		"deliveryHours",
		"lockOrderHoursBeforeDelivery",
		"closings",
		"denormalizedClosings",
	]),
	kind: { value: values.kind, validators: ["required", "min:3"], enabled: true },
	openings: {
		value: values.denormalizedDeliveryHours,
		validators: ["required", "openingsDays", "openingsDates"],
		enabled: true,
	},
	maxPurchaseOrders: {
		value: values.maxPurchaseOrdersPerTimeSlot,
		validators: ["min:1"],
		enabled: values.limitOrdersCount,
	},
	lockPurchaseOrders: {
		value: values.lockOrderHoursBeforeDelivery,
		validators: ["min:1"],
		enabled: values.limitOrdersBefore,
	},
});

export const normalizeSellingPoint = (sellingPoint) =>
	omit(
		{
			...sellingPoint,
			address: { ...omit(sellingPoint.address, ["insee"]), country: "FR" },
			deliveryHours: normalizeOpeningHours(sellingPoint.denormalizedDeliveryHours),
			closings: normalizeClosingDates(sellingPoint.denormalizedClosings),
			lockOrderHoursBeforeDelivery: sellingPoint.limitOrdersBefore
				? sellingPoint.lockOrderHoursBeforeDelivery
				: null,
			maxPurchaseOrdersPerTimeSlot: sellingPoint.limitOrdersCount
				? sellingPoint.maxPurchaseOrdersPerTimeSlot
				: null,
		},
		["denormalizedDeliveryHours", "denormalizedClosings", "limitOrdersBefore", "limitOrdersCount"]
	);

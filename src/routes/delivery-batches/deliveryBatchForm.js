import ModificationKind from "../../enums/ModificationKind";
import { timeSpanToTime } from "../../helpers/app";
import { getDefaultFields } from "../../stores/form";

export const initialValues = {
	name: "",
	scheduledOn: new Date(),
};

export const validators = (delivery) => ({
	...getDefaultFields(delivery, initialValues, []),
});

export const normalizeDeliveryBatch = (delivery) => ({
	id: delivery.id,
	name: delivery.name,
	deliveries: delivery.deliveries.map((o, index) => ({
		clientId: o.client.id,
		position: index,
		purchaseOrderIds: o.purchaseOrders.map((p) => p.id),
	})),
});

export const denormalizeDeliveryBatch = (delivery) => ({
	...delivery,
	deliveries: delivery.deliveries.sort((a, b) => a.position - b.position),
	from: timeSpanToTime(delivery.from),
	scheduledOn: new Date(delivery.scheduledOn),
});

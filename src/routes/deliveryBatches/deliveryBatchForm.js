import { getDefaultFields } from "../../stores/form";
import { timeSpanToTime } from "../../helpers/app";
import omit from "lodash/omit";

export const initialValues = {
	name: "",
	scheduledOn: new Date()
};

export const validators = (delivery) => ({
	...getDefaultFields(delivery, initialValues, [
	]),
});

export const normalizeDeliveryBatch = delivery => ({
	id: delivery.id,
	name: delivery.name,
	deliveries: delivery.deliveries.map((o, index) => ({ 
		clientId: o.clientId, 
		position: index, 
		purchaseOrderIds: o.purchaseOrders.map((p) => p.id) 
	}))
});

export const denormalizeDeliveryBatch = delivery => ({
	...delivery,
	from: timeSpanToTime(delivery.from),
	scheduledOn: new Date(delivery.scheduledOn)
})
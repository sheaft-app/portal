import OrderStatusKind from "./../../enums/OrderStatusKind";

export const canCreatePickingOrders = (selectedItems) => 
  selectedItems.length > 0 && selectedItems.filter(o => canCreatePickingOrder(o)).length == selectedItems.length;

export const canCancelOrders = (selectedItems) => 
  selectedItems.length > 0 && selectedItems.filter(o => canCancelOrder(o)).length == selectedItems.length;

export const canAcceptOrders = (selectedItems) => 
  selectedItems.length > 0 && selectedItems.filter(o => canAcceptOrder(o)).length == selectedItems.length;

export const canRefuseOrders = (selectedItems) => 
  selectedItems.length > 0 && selectedItems.filter(o => canRefuseOrder(o)).length == selectedItems.length;

export const canProcessOrders = (selectedItems) => 
  selectedItems.length > 0 && selectedItems.filter(o => canProcessOrder(o)).length == selectedItems.length;

export const canCompleteOrders = (selectedItems) => 
  selectedItems.length > 0 && selectedItems.filter(o => canCompleteOrder(o)).length == selectedItems.length;

export const canDeliverOrders = (selectedItems) =>
  selectedItems.length > 0 && selectedItems.filter(o => canDeliverOrder(o)).length == selectedItems.length;

export const canShipOrders = (selectedItems) =>
  selectedItems.length > 0 && selectedItems.filter(o => canShipOrder(o)).length == selectedItems.length;

export const canCreatePickingOrder = o => o && 
  o.status == OrderStatusKind.Waiting.Value ||
  o.status == OrderStatusKind.Accepted.Value ||
  o.status == OrderStatusKind.Processing.Value;

export const canCancelOrder = o => o &&
  o.status != OrderStatusKind.Completed.Value &&
  o.status != OrderStatusKind.Shipping.Value &&
  o.status != OrderStatusKind.Delivered.Value &&
  o.status != OrderStatusKind.Cancelled.Value &&
  o.status != OrderStatusKind.Refused.Value &&
  o.status != OrderStatusKind.Waiting.Value;

export const canAcceptOrder = o => o &&
  o.status == OrderStatusKind.Waiting.Value;

export const canRefuseOrder = o => o &&
  o.status == OrderStatusKind.Waiting.Value;

export const canProcessOrder = o => o &&
  o.status == OrderStatusKind.Accepted.Value;

export const canCompleteOrder = o => o &&
  o.status == OrderStatusKind.Processing.Value;

export const canDeliverOrder = o => o &&
  o.status == OrderStatusKind.Completed.Value || o.status == OrderStatusKind.Shipping.Value;

export const canShipOrder = o => o &&
  o.status == OrderStatusKind.Completed.Value;
import PurchaseOrderStatusKind from "../../enums/PurchaseOrderStatusKind";

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
  o.status == PurchaseOrderStatusKind.Waiting.Value ||
  o.status == PurchaseOrderStatusKind.Accepted.Value ||
  o.status == PurchaseOrderStatusKind.Processing.Value;

export const canCancelOrder = o => o &&
  o.status != PurchaseOrderStatusKind.Completed.Value &&
  o.status != PurchaseOrderStatusKind.Shipping.Value &&
  o.status != PurchaseOrderStatusKind.Delivered.Value &&
  o.status != PurchaseOrderStatusKind.Cancelled.Value &&
  o.status != PurchaseOrderStatusKind.Refused.Value &&
  o.status != PurchaseOrderStatusKind.Waiting.Value;

export const canAcceptOrder = o => o &&
  o.status == PurchaseOrderStatusKind.Waiting.Value;

export const canRefuseOrder = o => o &&
  o.status == PurchaseOrderStatusKind.Waiting.Value;

export const canProcessOrder = o => o &&
  o.status == PurchaseOrderStatusKind.Accepted.Value;

export const canCompleteOrder = o => o &&
  o.status == PurchaseOrderStatusKind.Processing.Value;

export const canDeliverOrder = o => o &&
  o.status == PurchaseOrderStatusKind.Completed.Value || o.status == PurchaseOrderStatusKind.Shipping.Value;

export const canShipOrder = o => o &&
  o.status == PurchaseOrderStatusKind.Completed.Value;

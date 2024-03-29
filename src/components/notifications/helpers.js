import {
	faCheck,
	faExclamation,
	faExclamationTriangle,
	faInfo,
	faPause,
	faQuestion,
	faRedoAlt,
	faTimes,
} from "@fortawesome/free-solid-svg-icons";

import Guid from "./../../helpers/Guid.js";

export const getFormattedNotification = (notification, local, display) => {
	if (notification) {
		if (notification.content && typeof notification.content == "string" && notification.content.length > 0) {
			notification.content = JSON.parse(notification.content);
		}

		if (notification.content == null) {
			notification.content = {};
		}

		switch (notification.method) {
			case "AgreementCreatedByProducerEvent":
			case "AgreementCreatedByStoreEvent":
				return getNotification(
					notification,
					"info",
					`Nouvelle demande de partenariat.`,
					`#/agreements/${notification.content.AgreementId}?refresh=${Guid.NewGuid()}`,
					true,
					true
				);
			case "AgreementAcceptedByStoreEvent":
			case "AgreementAcceptedByProducerEvent":
				return getNotification(
					notification,
					"success",
					`Votre demande de partenariat a été accepté.`,
					`#/agreements/${notification.content.AgreementId}?refresh=${Guid.NewGuid()}`,
					true,
					true,
					local
				);
			case "AgreementCancelledByStoreEvent":
			case "AgreementCancelledByProducerEvent":
				return getNotification(
					notification,
					"warning",
					`Votre partenariat a été annulé.`,
					`#/agreements/${notification.content.AgreementId}?refresh=${Guid.NewGuid()}`,
					true,
					true,
					local
				);
			case "AgreementRefusedByStoreEvent":
			case "AgreementRefusedByProducerEvent":
				return getNotification(
					notification,
					"error",
					`Votre demande de partenariat a été refusée.`,
					`#/agreements/${notification.content.AgreementId}?refresh=${Guid.NewGuid()}`,
					true,
					true
				);
			case "UserDataExportProcessingEvent":
				return getNotification(
					notification,
					"progress",
					`Votre export de données est en cours.`,
					`#/jobs/${notification.content.JobId ? notification.content.JobId : ""}?refresh=${Guid.NewGuid()}`,
					true,
					false
				);
			case "UserDataExportSucceededEvent":
				return getNotification(
					notification,
					"success",
					`Votre export de données est terminé.`,
					`#/jobs/${notification.content.JobId ? notification.content.JobId : ""}?refresh=${Guid.NewGuid()}`,
					true,
					true
				);
			case "UserDataExportFailedEvent":
				return getNotification(
					notification,
					"warning",
					`Votre export de données a échoué.`,
					`#/jobs/${notification.content.JobId ? notification.content.JobId : ""}?refresh=${Guid.NewGuid()}`,
					true,
					true
				);
			case "PickingOrderExportFailedEvent":
				return getNotification(
					notification,
					"warning",
					`La création de votre bon de préparation a échoué.`,
					`#/jobs/${notification.content.JobId ? notification.content.JobId : ""}?refresh=${Guid.NewGuid()}`,
					true,
					true
				);
			case "PickingOrderExportProcessingEvent":
				return getNotification(
					notification,
					"progress",
					`Votre bon de préparation est en cours de génération...`,
					`#/jobs/${notification.content.JobId ? notification.content.JobId : ""}?refresh=${Guid.NewGuid()}`,
					true,
					false
				);
			case "PickingOrderExportSucceededEvent":
				return getNotification(
					notification,
					"success",
					`Votre bon de préparation est prêt !`,
					`#/jobs/${notification.content.JobId ? notification.content.JobId : ""}?refresh=${Guid.NewGuid()}`,
					true,
					true
				);
			case "ProductImportFailedEvent":
				return getNotification(
					notification,
					"warning",
					`L'import de vos produits a échoué.`,
					`#/jobs/${notification.content.JobId ? notification.content.JobId : ""}?refresh=${Guid.NewGuid()}`,
					true,
					true
				);
			case "ProductImportProcessingEvent":
				return getNotification(
					notification,
					"progress",
					`L'import de vos produits est en cours...`,
					`#/jobs/${notification.content.JobId ? notification.content.JobId : ""}?refresh=${Guid.NewGuid()}`,
					true,
					false
				);
			case "ProductImportSucceededEvent":
				return getNotification(
					notification,
					"success",
					`Votre import de produits est terminé !`,
					`#/products/?refresh=${Guid.NewGuid()}`,
					true,
					true
				);
			case "PurchaseOrderReceivedEvent":
				return getNotification(
					notification,
					"info",
					`Vous avez reçu une nouvelle commande.`,
					`#/purchase-orders/${
						notification.content.PurchaseOrderId ? notification.content.PurchaseOrderId : ""
					}?refresh=${Guid.NewGuid()}`,
					true,
					true
				);
			case "PurchaseOrderProcessingEvent":
				return getNotification(
					notification,
					"progress",
					`Votre commande est en cours de préparation.`,
					`#/my-orders/${
						notification.content.PurchaseOrderId ? notification.content.PurchaseOrderId : ""
					}?refresh=${Guid.NewGuid()}`,
					true,
					true
				);
			case "PurchaseOrderWithdrawnedEvent":
				return getNotification(
					notification,
					"warning",
					`Une commande a été annulée.`,
					`#/purchase-orders/${
						notification.content.PurchaseOrderId ? notification.content.PurchaseOrderId : ""
					}?refresh=${Guid.NewGuid()}`,
					true,
					true
				);
			case "PurchaseOrderCancelledEvent":
				return getNotification(
					notification,
					"error",
					`Votre commande a été annulée.`,
					`#/my-orders/${
						notification.content.PurchaseOrderId ? notification.content.PurchaseOrderId : ""
					}?refresh=${Guid.NewGuid()}`,
					true,
					true
				);
			case "PurchaseOrderExpiredEvent":
				return getNotification(
					notification,
					"error",
					`Commande expirée.`,
					`#/my-orders/${
						notification.content.PurchaseOrderId ? notification.content.PurchaseOrderId : ""
					}?refresh=${Guid.NewGuid()}`,
					true,
					local
				);
			case "PurchaseOrderCompletedEvent":
				return getNotification(
					notification,
					"success",
					`Votre commande est prête.`,
					`#/my-orders/${notification.content.PurchaseOrderId}?refresh=${Guid.NewGuid()}`,
					true,
					true
				);
			case "PurchaseOrderRefusedEvent":
				return getNotification(
					notification,
					"error",
					`Votre commande a été refusée par le producteur.`,
					`#/my-orders/${notification.content.PurchaseOrderId}?refresh=${Guid.NewGuid()}`,
					true,
					true
				);
			case "PurchaseOrderAcceptedEvent":
				return getNotification(
					notification,
					"info",
					`Votre commande a été acceptée.`,
					`#/my-orders/${notification.content.PurchaseOrderId}?refresh=${Guid.NewGuid()}`,
					true,
					true
				);
			case "PreAuthorizationFailedEvent":
				return getNotification(
					notification,
					"warning",
					`Le paiement de votre commande a échoué.`,
					`#/my-orders/?refresh=${Guid.NewGuid()}`,
					true,
					true
				);
			case "OrderConfirmedEvent":
				return getNotification(
					notification,
					"success",
					`Votre commande a été prise en compte.`,
					`#${notification.content.PortalUrl?.split("#")[1]}`,
					true,
					true
				);
			case "DeliveryFormGeneratedEvent":
				return getNotification(
					notification,
					"success",
					`Votre bon de livraison est disponible.`,
					notification.content.Url,
					true,
					true
				);
			case "DeliveryReceiptGeneratedEvent":
				return getNotification(
					notification,
					"success",
					`Le bon de réception de votre commande est disponible.`,
					notification.content.Url,
					true,
					true
				);
			case "DeliveryBatchFormsGeneratedEvent":
				return getNotification(
					notification,
					"success",
					`Les bons de livraisons pour votre tournée sont prêt.`,
					notification.content.Url,
					true,
					true
				);
			case "DeliveryBatchPendingEvent":
				return getNotification(
					notification,
					"info",
					`Vous avez une livraison programmée qui n'est toujours pas terminée.`,
					`#${notification.content.Url?.split("#")[1]}`,
					true,
					true
				);
			case "DeliveryPostponedEvent":
				return getNotification(
					notification,
					"success",
					`${notification.content.ProducerName} a décalé la livraison.`,
					`#${notification.content.Url?.split("#")[1]}`,
					true,
					true
				);
			case "ObservationAddedEvent":
				return getNotification(
					notification,
					"success",
					`Une nouvelle observation a été émise.`,
					`#${notification.content.PortalUrl?.split("#")[1]}`,
					true,
					true
				);
			case "RecallSentEvent":
				console.log(notification);
				return getNotification(
					notification,
					"success",
					`${notification.content.ProducerName} procède au rappel de certains produits.`,
					`#${notification.content.PortalUrl?.split("#")[1]}`,
					true,
					true
				);
			case "ObservationRepliedEvent":
				return getNotification(
					notification,
					"success",
					`Une réponse a été apportée à une observation.`,
					`#${notification.content.PortalUrl?.split("#")[1]}`,
					true,
					true
				);
			default:
				return null;
		}
	}

	return getNotification(notification, local.type, local.message, local.url, display, false);
};

export const getNotificationIcon = (notification) => {
	switch (notification.type) {
		case "success":
		case "primary":
			return faCheck;
		case "info":
			return faInfo;
		case "warning":
			return faExclamationTriangle;
		case "error":
			return faTimes;
		case "hold":
		case "pause":
			return faPause;
		case "help":
		case "question":
			return faQuestion;
		case "progress":
			return faRedoAlt;
		case "accent":
			return faExclamation;
		default:
			return null;
	}
};

export const getNotificationColor = (notification) => {
	return `${notification.type}-color`;
};

const getNotification = (notification, type, message, url, show, addToStore) => {
	if (!notification) notification = { content: {} };

	return {
		id: notification.id ? notification.id : Guid.NewGuid(),
		type: type ? type : notification.type ? notification.type : "info",
		message: message ? message : notification.message ? notification.message : notification.content.Message,
		url: url ? url : notification.url,
		show: show != null ? show : notification.show != null ? notification.show : true,
		unread: notification.unread != null ? notification.unread : true,
		createdOn: notification.createdOn ? new Date(notification.createdOn) : new Date(),
		addToStore: addToStore != null ? addToStore : notification.addToStore != null ? notification.addToStore : true,
		content: notification.content,
	};
};

import {
    faCheck,
    faInfo,
    faPause,
    faRedoAlt,
    faQuestion,
    faTimes,
    faExclamationTriangle,
    faExclamation
  } from "@fortawesome/free-solid-svg-icons";
  import Guid from "./../../helpers/Guid.js";
  import {GET_PRODUCTS} from "./../../routes/products/queries";
  

export const getFormattedNotification = (graphql, notification, local, display) => {
	if(notification.content && typeof(notification.content) == "string" && notification.content.length > 0){
		notification.content = JSON.parse(notification.content);
	}

	if(notification.content == null){
		notification.content = {};
	}

	switch (notification.method) {
		case "AgreementCreatedByStoreEvent":
			return getNotification(
				notification,
				"info",
				`Un magasin souhaiterait commercer avec vous.`,
				`#/agreements/${notification.content.AgreementId}`,
				true,
				false,
				local
			);
		case "AgreementCreatedByProducerEvent":
			return getNotification(
				notification,
				"info",
				`Un producteur souhaiterait commercer avec vous.`,
				`#/agreements/${notification.content.AgreementId}`,
				true,
				false,
				local
			);
		case "AgreementAcceptedByStoreEvent":
			return getNotification(
				notification,
				"success",
				`Votre demande d'accord commercial a été acceptée.`,
				`#/agreements/${notification.content.AgreementId}`,
				true,
				false,
				local
			);
		case "AgreementAcceptedByProducerEvent":
			return getNotification(
				notification,
				"success",
				`Votre demande d'accord commercial a été acceptée.`,
				`#/agreements/${notification.content.AgreementId}`,
				true,
				false,
				local
			);
		case "AgreementCancelledByStoreEvent":
			return getNotification(
				notification,
				"warning",
				`Un accord commercial a été annulé par un magasin.`,
				`#/agreements/${notification.content.AgreementId}`,
				true,
				false,
				local
			);
		case "AgreementCancelledByProducerEvent":
			return getNotification(
				notification,
				"warning",
				`Un accord commercial a été annulé par un producteur.`,
				`#/agreements/${notification.content.AgreementId}`,
				true,
				false,
				local
			);
		case "AgreementRefusedByStoreEvent":
			return getNotification(
				notification,
				"error",
				`Votre demande d'accord commercial a été refusée.`,
				`#/agreements/${notification.content.AgreementId}`,
				true,
				false,
				local
			);
		case "AgreementRefusedByProducerEvent":
			return getNotification(
				notification,
				"error",
				`Votre demande d'accord commercial a été refusée.`,
				`#/agreements/${notification.content.AgreementId}`,
				true,
				false,
				local
			);
		case "UserDataExportProcessingEvent":
			return getNotification(
				notification,
				"progress",
				`Votre export de données est en cours.`,
				`#/jobs/${notification.content.JobId}`,
				true,
				false,
				local
			);
		case "UserDataExportSucceededEvent":
			return getNotification(
				notification,
				"success",
				`Votre export de données est terminé.`,
				`${notification.content.Url}`,
				true,
				true,
				local
			);
		case "UserDataExportFailedEvent":
			return getNotification(
				notification,
				"warning",
				`Votre export de données a échoué.`,
				`#/jobs/${notification.content.JobId}`,
				true,
				true,
				local
			);
		case "ProductRatedEvent":
			return getNotification(
				notification,
				"info",
				`${notification.content.SenderName} a laissé un avis sur '${notification.content.ProductName}.'`,
				`#/products/${notification.content.ProductId}/ratings`,
				true,
				true,
				local
			);
		case "PickingOrderExportFailedEvent":
			return getNotification(
				notification,
				"warning",
				`La création de votre bon de préparation '${notification.content.Name}' a échoué.`,
				`#/jobs/${notification.content.JobId}`,
				true,
				true,
				local
			);
		case "PickingOrderExportProcessingEvent":
			return getNotification(
				notification,
				"progress",
				`Votre bon de préparation '${notification.content.Name}' est en cours de création`,
				`#/jobs/${notification.content.JobId}`,
				true,
				false,
				local
			);
		case "PickingOrderExportSucceededEvent":
			return getNotification(
				notification,
				"success",
				`Votre bon de préparation '${notification.content.Name}' est prêt`,
				`${notification.content.Url}`,
				true,
				true,
				local
			);
		case "ProductImportFailedEvent":
			return getNotification(
				notification,
				"warning",
				`L'import de vos produits a échoué`,
				`#/jobs/${notification.content.JobId}`,
				true,
				true,
				local
			);
		case "ProductImportProcessingEvent":
			return getNotification(
				notification,
				"progress",
				`L'import de vos produits est en cours`,
				`#/jobs/${notification.content.JobId}`,
				true,
				false,
				local
			);
		case "ProductImportSucceededEvent":
			if(graphql){
				graphql.clearApolloCache(GET_PRODUCTS);
				if(location.hash.indexOf('products') > -1)
					location.reload();
			}

			return getNotification(
				notification,
				"success",
				`Votre import de produits est terminé`,
				`#/products/`,
				true,
				true,
				local
			);
		case "PurchaseOrderCreatedEvent":
			return getNotification(
				notification,
				"info",
				`Votre commande pour le ${notification.content.ExpectedDeliveryDate} a bien été envoyée.`,
				`#/my-orders/${notification.content.PurchaseOrderId}`,
				true,
				false,
				local
			);
		case "PurchaseOrderReceivedEvent":
			return getNotification(
				notification,
				"info",
				`${notification.content.SenderName} a passé commande pour le ${notification.content.ExpectedDeliveryDate}.`,
				`#/orders/${notification.content.PurchaseOrderId}`,
				true,
				false,
				local
			);
		case "PurchaseOrderProcessingEvent":
			return getNotification(
				notification,
				"progress",
				`${notification.content.VendorName} est en train de préparer votre commande.`,
				`#/my-orders/${notification.content.PurchaseOrderId}`,
				true,
				true,
				local
			);
		case "PurchaseOrderWithdrawnEvent":
			return getNotification(
				notification,
				"warning",
				`${notification.content.SenderName} a annulé votre commande pour le ${notification.content.ExpectedDeliveryDate}.`,
				`#/orders/${notification.content.PurchaseOrderId}`,
				true,
				true,
				local
			);
		case "PurchaseOrderCancelledEvent":
			return getNotification(
				notification,
				"error",
				`Votre commande ${notification.content.Reference} a été annulée.`,
				`#/my-orders/${notification.content.PurchaseOrderId}`,
				true,
				true,
				local
			);
		case "PurchaseOrderCompletedEvent":
			return getNotification(
				notification,
				"success",
				`Votre commande ${notification.content.Reference} est prête.`,
				`#/my-orders/${notification.content.PurchaseOrderId}`,
				true,
				true,
				local
			);
		case "PurchaseOrderRefusedEvent":
			return getNotification(
				notification,
				"error",
				`${notification.content.VendorName} a refusé votre commande.`,
				`#/my-orders/${notification.content.PurchaseOrderId}`,
				true,
				true,
				local
			);
		case "PurchaseOrderAcceptedEvent":
			return getNotification(
				notification,
				"info",
				`${notification.content.VendorName} a accepté votre commande.`,
				`#/my-orders/${notification.content.PurchaseOrderId}`,
				true,
				true,
				local
			);
		case "PayinSucceededEvent":
			return getNotification(
				notification,
				"success",
				`Le paiement de votre commande de ${notification.content.TotalPrice}€ a été accepté.`,
				`#/my-orders`,
				true,
				true,
				local
			);
		case "UserPointsCreatedEvent":
			var action = "contribué à l'économie locale";
			switch (notification.content.Kind) {
				case "BUG_BOUNTY":
					action = "déclaré un bug à notre support";
					break;
				case "SPONSORING":
					action = "parrainé un nouvel utilisateur";
					break;
				case "PURCHASE_ORDER":
					action = "commandé auprès d'un producteur local";
					break;
				case "RATE_PRODUCT":
					action = "donné votre avis sur un produit local";
					break;
			}
			return getNotification(
				notification,
				"info",
				`Merci pour votre implication ! Vous avez reçu ${notification.content.Points} points pour avoir ${action}.`,
				`#/leaderboard/all`,
				true,
				true,
				local
			);
		default:
			return getNotification(
				notification,
				null,
				null,
				null,
				display,
				null,
				local
			);
	}
}

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
}

export const getNotificationColor = (notification) => {
	return `${notification.type}-color`;
}

const getNotification = (notification, type, message, url, show, addToStore, local) => {
	return {
		id: notification.id ? notification.id : Guid.NewGuid(),
		type: type ? type : (notification.type ? notification.type : 'info'),
		message: message ? message : (notification.message ? notification.message : notification.content.Message),
		url: url ? url : notification.url,
		show: show != null ? show : (notification.show != null ? notification.show : true),
		unread:notification.unread != null ? notification.unread : true,
		createdOn: notification.createdOn ? new Date(notification.createdOn) : new Date(),
		addToStore: addToStore != null ? addToStore : (notification.addToStore != null ? notification.addToStore : true),
		content: notification.content,
		local: local
	}
}

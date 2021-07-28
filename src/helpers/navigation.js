import Roles from "./../enums/Roles";
import SearchProductRoutes from "../routes/search-products/routes";
import ProductRoutes from "../routes/products/routes";
import QuickOrderRoutes from "../routes/quick-orders/routes";
import RegisterRoutes from "../routes/register/routes";
import PurchaseOrderRoutes from "../routes/purchase-orders/routes";
import QuickPurchaseRoutes from "../routes/quick-purchases/routes";

export const goToHome = (authManager, routerInstance) => {
	if (authManager.authenticated && !authManager.registered) {
		routerInstance.goTo(RegisterRoutes.Choose);
		return;
	}

	if (authManager.isInRole([Roles.Producer.Value])) {
		routerInstance.goTo(PurchaseOrderRoutes.List);
		return;
	}

	if (authManager.isInRole([Roles.Store.Value])) {
		routerInstance.goTo(QuickPurchaseRoutes.Purchase);
		return;
	}

	routerInstance.goTo(SearchProductRoutes.Search);
};

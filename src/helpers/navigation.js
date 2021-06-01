import Roles from "./../enums/Roles";
import SearchProductRoutes from "../routes/search-products/routes";
import ProductRoutes from "../routes/products/routes";
import QuickOrderRoutes from "../routes/quick-orders/routes";

export const goToHome = (authManager, routerInstance) => {
	if (authManager.isInRole([Roles.Producer.Value])) {
		routerInstance.goTo(ProductRoutes.List);
		return;
	}

	if (authManager.isInRole([Roles.Store.Value])) {
		routerInstance.goTo(QuickOrderRoutes.Purchase);
		return;
	}

	routerInstance.goTo(SearchProductRoutes.Search);
};

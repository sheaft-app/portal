import Roles from "./../enums/Roles";
import SearchProductRoutes from "../routes/search-products/routes";
import ProductRoutes from "../routes/products/routes";

export const goToHome = (authManager, routerInstance) => {
  if (authManager.isInRole([Roles.Consumer.Value])) {
    routerInstance.goTo(SearchProductRoutes.Search)
  }

  if (authManager.isInRole([Roles.Producer.Value])) {
    routerInstance.goTo(ProductRoutes.List)
  }

  // todo
  if (authManager.isInRole([Roles.Store.Value])) {
    routerInstance.goTo(SearchProductRoutes.Search)
  }
}
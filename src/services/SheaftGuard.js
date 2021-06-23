import { wrap } from "svelte-spa-router/wrap";
import Home from "./../routes/home/Home.svelte";
import Cart from "./../routes/cart/Cart.svelte";
import Register from "./../routes/register/Register.svelte";
import PurchaseOrders from "./../routes/purchase-orders/PurchaseOrders.svelte";
import MyOrders from "./../routes/my-orders/MyOrders.svelte";
import Account from "./../routes/account/Account.svelte";
import Sponsorship from "./../routes/sponsorship/Sponsorship.svelte";
import SellingPoints from "./../routes/selling-points/SellingPoints.svelte";
import Deliveries from "./../routes/deliveries/Deliveries.svelte";
import Returnables from "./../routes/returnables/Returnables.svelte";
import Catalogs from "../routes/catalogs/Catalogs.svelte";
import Callback from "./../routes/oidc/Callback.svelte";
import CallbackSilent from "./../routes/oidc/CallbackSilent.svelte";
import NotFound from "./../routes/home/NotFound.svelte";
import Unauthorized from "./../routes/home/Unauthorized.svelte";
import ServerError from "./../routes/home/ServerError.svelte";
import QuickOrders from "./../routes/quick-orders/QuickOrders.svelte";
import Products from "./../routes/products/Products.svelte";
import Jobs from "./../routes/jobs/Jobs.svelte";
import SearchProducts from "./../routes/search-products/SearchProducts.svelte";
import SearchProducers from "./../routes/search-producers/SearchProducers.svelte";
import SearchStores from "./../routes/search-stores/SearchStores.svelte";
import Agreements from "./../routes/agreements/Agreements.svelte";
import External from "./../routes/external/External.svelte";
import DeliveryBatches from "./../routes/deliveryBatches/DeliveryBatches.svelte";

import ProductRoutes from "./../routes/products/routes.js";
import JobRoutes from "./../routes/jobs/routes.js";
import SearchStoreRoutes from "./../routes/search-stores/routes.js";
import SearchProducerRoutes from "./../routes/search-producers/routes.js";
import AgreementRoutes from "./../routes/agreements/routes.js";
import ReturnableRoutes from "./../routes/returnables/routes.js";
import SponsorshipRoutes from "./../routes/sponsorship/routes.js";
import RegisterRoutes from "./../routes/register/routes.js";
import CartRoutes from "./../routes/cart/routes.js";
import AccountRoutes from "./../routes/account/routes.js";
import SearchProductRoutes from "./../routes/search-products/routes.js";
import ExternalRoutes from "./../routes/external/routes.js";
import PurchaseOrderRoutes from "./../routes/purchase-orders/routes.js";
import MyOrderRoutes from "./../routes/my-orders/routes.js";
import SellingPointRoutes from "./../routes/selling-points/routes.js";
import DeliveryRoutes from "./../routes/deliveries/routes.js";
import QuickOrderRoutes from "./../routes/quick-orders/routes.js";
import OidcRoutes from "./../routes/oidc/routes.js";
import HomeRoutes from "./../routes/home/routes.js";
import Roles from "./../enums/Roles";
import { authInitialized } from "../stores/auth";
import CatalogRoutes from "../routes/catalogs/routes";
import DeliveryBatchesRoutes from "../routes/deliveryBatches/routes";

class SheaftGuard {
	constructor(authInstance, routerInstance) {
		this.authInstance = authInstance;
		this.routerInstance = routerInstance;

		this.routes = {};

		this.routes[`${RegisterRoutes.Prefix}/*`] = wrap({
			component: Register,
			customData: null,
			conditions: [
				() =>
					this.handleRouteNavigation(
						() => this.authInstance.userIsLoggedIn() && !this.authInstance.userIsRegistered(),
						true
					),
			],
		});
		this.routes[`${CartRoutes.Prefix}/*`] = wrap({
			component: Cart,
			customData: null,
			conditions: [() => this.handleRouteNavigation(() => this.authInstance.userHasAccess(CartRoutes.Roles), true)],
		});
		this.routes[`${ProductRoutes.Prefix}/*`] = wrap({
			component: Products,
			customData: null,
			conditions: [() => this.handleRouteNavigation(() => this.authInstance.userHasAccess(ProductRoutes.Roles), true)],
		});
		this.routes[`${JobRoutes.Prefix}/*`] = wrap({
			component: Jobs,
			customData: null,
			conditions: [() => this.handleRouteNavigation(() => this.authInstance.userHasAccess(JobRoutes.Roles), true)],
		});
		this.routes[`${AgreementRoutes.Prefix}/*`] = wrap({
			component: Agreements,
			customData: null,
			conditions: [
				() => this.handleRouteNavigation(() => this.authInstance.userHasAccess(AgreementRoutes.Roles), true),
			],
		});
		this.routes[`${ReturnableRoutes.Prefix}/*`] = wrap({
			component: Returnables,
			customData: null,
			conditions: [
				() => this.handleRouteNavigation(() => this.authInstance.userHasAccess(ReturnableRoutes.Roles), true),
			],
		});
		this.routes[`${CatalogRoutes.Prefix}/*`] = wrap({
			component: Catalogs,
			customData: null,
			conditions: [() => this.handleRouteNavigation(() => this.authInstance.userHasAccess(CatalogRoutes.Roles), true)],
		});
		this.routes[`${SponsorshipRoutes.Prefix}/*`] = wrap({
			component: Sponsorship,
			customData: null,
			conditions: [
				() => this.handleRouteNavigation(() => this.authInstance.userHasAccess(SponsorshipRoutes.Roles), true),
			],
		});
		this.routes[`${AccountRoutes.Prefix}/*`] = wrap({
			component: Account,
			customData: null,
			conditions: [() => this.handleRouteNavigation(() => this.authInstance.userHasAccess(AccountRoutes.Roles), true)],
		});
		this.routes[`${SellingPointRoutes.Prefix}/*`] = wrap({
			component: SellingPoints,
			customData: null,
			conditions: [
				() => this.handleRouteNavigation(() => this.authInstance.userHasAccess(SellingPointRoutes.Roles), true),
			],
		});
		this.routes[`${DeliveryRoutes.Prefix}/*`] = wrap({
			component: Deliveries,
			customData: null,
			conditions: [() => this.handleRouteNavigation(() => this.authInstance.userHasAccess(DeliveryRoutes.Roles), true)],
		});
		this.routes[`${PurchaseOrderRoutes.Prefix}/*`] = wrap({
			component: PurchaseOrders,
			customData: null,
			conditions: [
				() => this.handleRouteNavigation(() => this.authInstance.userHasAccess(PurchaseOrderRoutes.Roles), true),
			],
		});
		this.routes[`${MyOrderRoutes.Prefix}/*`] = wrap({
			component: MyOrders,
			customData: null,
			conditions: [() => this.handleRouteNavigation(() => this.authInstance.userHasAccess(MyOrderRoutes.Roles), true)],
		});
		this.routes[`${QuickOrderRoutes.Prefix}/*`] = wrap({
			component: QuickOrders,
			customData: null,
			conditions: [
				() => this.handleRouteNavigation(() => this.authInstance.userHasAccess(QuickOrderRoutes.Roles), true),
			],
		});
		this.routes[`${SearchProductRoutes.Prefix}`] = wrap({
			component: SearchProducts,
			customData: null,
			conditions: [
				() =>
					this.handleRouteNavigation(
						() => this.authInstance.userIsAnonymous() || this.authInstance.userHasAccess(SearchProductRoutes.Roles),
						true
					),
			],
		});
		this.routes[`${DeliveryBatchesRoutes.Prefix}/*`] = wrap({
			component: DeliveryBatches,
			customData: null,
			conditions: [
				() =>
					this.handleRouteNavigation(
						() => this.authInstance.userIsAnonymous() || this.authInstance.userHasAccess(DeliveryBatchesRoutes.Roles),
						true
					),
			],
		});
		this.routes[`${ExternalRoutes.Prefix}/*`] = wrap({
			component: External,
			customData: null,
			conditions: [
				() =>
					this.handleRouteNavigation(
						() => this.authInstance.userIsAnonymous() || this.authInstance.userHasAccess(ExternalRoutes.Roles),
						true
					),
			],
		});
		this.routes[`${SearchStoreRoutes.Prefix}`] = wrap({
			component: SearchStores,
			customData: null,
			conditions: [() => this.handleRouteNavigation(() => this.authInstance.userHasAccess(SearchStoreRoutes.Roles))],
		});
		this.routes[`${SearchProducerRoutes.Prefix}`] = wrap({
			component: SearchProducers,
			customData: null,
			conditions: [() => this.handleRouteNavigation(() => this.authInstance.userHasAccess(SearchProducerRoutes.Roles))],
		});

		this.routes[`${OidcRoutes.Callback.Path}`] = Callback;
		this.routes[`${OidcRoutes.CallbackSilent.Path}`] = CallbackSilent;
		this.routes[`${HomeRoutes.Unauthorized.Path}`] = Unauthorized;
		this.routes[`${HomeRoutes.Error.Path}`] = ServerError;
		this.routes[`${HomeRoutes.NotFound.Path}`] = NotFound;

		this.routes["*"] = wrap({
			component: Home,
			customData: null,
			conditions: [
				() => {
					if (this.routerInstance.currentUrl.indexOf(RegisterRoutes.Prefix) > -1) return false;

					var redirectRoute = this.getRedirectRoute();
					this.routerInstance.goTo(redirectRoute, null, true);
					return false;
				},
			],
		});

		this.initializedSub = authInitialized.subscribe((initialized) => {
			if (initialized && this.authInstance.authorized && !this.authInstance.registered)
				this.routerInstance.goTo(RegisterRoutes.Choose);
		});
	}

	getRedirectRoute() {
		var user = this.authInstance.user;
		if (user && user.state && user.state.redirectTo && user.state.redirectTo.slice(1) != "/") {
			return {
				Path: user.state.redirectTo.slice(1),
				Params: null,
			};
		}

		if (this.authInstance.isInRole([Roles.Producer.Value])) {
			return {
				Path: ProductRoutes.List.Path,
				Params: null,
			};
		}

		if (this.authInstance.isInRole([Roles.Store.Value])) {
			return {
				Path: QuickOrderRoutes.Purchase.Path,
				Params: null,
			};
		}

		return {
			Path: SearchProductRoutes.Prefix,
			Params: {
				Query: {
					sort: SearchProductRoutes.Search.Params.Query.sort,
				},
			},
		};
	}

	handleRouteNavigation(exec, autoRedirect) {
		if (
			this.authInstance.initialized &&
			this.authInstance.authorized &&
			!this.authInstance.registered &&
			this.routerInstance.currentUrl.indexOf(RegisterRoutes.Prefix) < 0
		) {
			this.routerInstance.goTo(RegisterRoutes.Choose, null, true);
			return false;
		}

		var result = exec();
		if (!result && autoRedirect) {
			this.routerInstance.goTo(HomeRoutes.Prefix, null, true);
		}

		return result;
	}

	unregister() {
		if (this.initializedSub && this.initializedSub.unsubscribe) this.initializedSub.unsubscribe();
	}
}

let guardInstance = null;

export function InitGuard(authInstance, routerInstance) {
	guardInstance = new SheaftGuard(authInstance, routerInstance);
	return guardInstance;
}

export default function GetGuardInstance() {
	return guardInstance;
}

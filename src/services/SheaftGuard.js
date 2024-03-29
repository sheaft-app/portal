import { wrap } from "svelte-spa-router/wrap";

import Roles from "./../enums/Roles";
import { authInitialized } from "../stores/auth";
import Account from "./../routes/account/Account.svelte";
import AccountRoutes from "./../routes/account/routes.js";
import Agreements from "./../routes/agreements/Agreements.svelte";
import AgreementRoutes from "./../routes/agreements/routes.js";
import Batches from "./../routes/batches/Batches.svelte";
import BatchesRoutes from "../routes/batches/routes";
import Billings from "./../routes/billings/Billings.svelte";
import BillingRoutes from "../routes/billings/routes";
import Cart from "./../routes/cart/Cart.svelte";
import CartRoutes from "./../routes/cart/routes.js";
import Catalogs from "../routes/catalogs/Catalogs.svelte";
import CatalogRoutes from "../routes/catalogs/routes";
import Deliveries from "./../routes/deliveries/Deliveries.svelte";
import DeliveryRoutes from "./../routes/deliveries/routes.js";
import DeliveryBatches from "./../routes/delivery-batches/DeliveryBatches.svelte";
import DeliveryBatchesRoutes from "../routes/delivery-batches/routes";
import ExpectedDeliveries from "./../routes/expected-deliveries/ExpectedDeliveries.svelte";
import ExpectedDeliveriesRoutes from "../routes/expected-deliveries/routes";
import External from "./../routes/external/External.svelte";
import ExternalRoutes from "./../routes/external/routes.js";
import Home from "./../routes/home/Home.svelte";
import NotFound from "./../routes/home/NotFound.svelte";
import ServerError from "./../routes/home/ServerError.svelte";
import Unauthorized from "./../routes/home/Unauthorized.svelte";
import HomeRoutes from "./../routes/home/routes.js";
import Jobs from "./../routes/jobs/Jobs.svelte";
import JobRoutes from "./../routes/jobs/routes.js";
import MyOrders from "./../routes/my-orders/MyOrders.svelte";
import MyOrderRoutes from "./../routes/my-orders/routes.js";
import MyRecalls from "./../routes/my-recalls/MyRecalls.svelte";
import MyRecallRoutes from "../routes/my-recalls/routes";
import Callback from "./../routes/oidc/Callback.svelte";
import CallbackSilent from "./../routes/oidc/CallbackSilent.svelte";
import OidcRoutes from "./../routes/oidc/routes.js";
import Pickings from "./../routes/pickings/Pickings.svelte";
import PickingRoutes from "../routes/pickings/routes";
import Products from "./../routes/products/Products.svelte";
import ProductRoutes from "./../routes/products/routes.js";
import PurchaseOrders from "./../routes/purchase-orders/PurchaseOrders.svelte";
import PurchaseOrderRoutes from "./../routes/purchase-orders/routes.js";
import QuickOrders from "./../routes/quick-orders/QuickOrders.svelte";
import QuickOrderRoutes from "./../routes/quick-orders/routes.js";
import QuickFreePurchase from "./../routes/quick-purchases/QuickFreePurchase.svelte";
import QuickTemplatePurchase from "./../routes/quick-purchases/QuickTemplatePurchase.svelte";
import QuickPurchaseRoutes from "../routes/quick-purchases/routes";
import Recalls from "./../routes/recalls/Recalls.svelte";
import RecallRoutes from "../routes/recalls/routes";
import Register from "./../routes/register/Register.svelte";
import RegisterRoutes from "./../routes/register/routes.js";
import Retrievals from "./../routes/retrievals/Retrievals.svelte";
import RetrievalRoutes from "../routes/retrievals/routes";
import Returnables from "./../routes/returnables/Returnables.svelte";
import ReturnableRoutes from "./../routes/returnables/routes.js";
import SearchProducers from "./../routes/search-producers/SearchProducers.svelte";
import SearchProducerRoutes from "./../routes/search-producers/routes.js";
import SearchProducts from "./../routes/search-products/SearchProducts.svelte";
import SearchProductRoutes from "./../routes/search-products/routes.js";
import SearchStores from "./../routes/search-stores/SearchStores.svelte";
import SearchStoreRoutes from "./../routes/search-stores/routes.js";
import SellingPoints from "./../routes/selling-points/SellingPoints.svelte";
import SellingPointRoutes from "./../routes/selling-points/routes.js";
import Sponsorship from "./../routes/sponsorship/Sponsorship.svelte";
import SponsorshipRoutes from "./../routes/sponsorship/routes.js";
import StoreTraceability from "./../routes/store-traceabilities/StoreTraceability.svelte";
import StoreTraceabilityRoutes from "../routes/store-traceabilities/routes";

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
			conditions: [
				() => this.handleRouteNavigation(() => this.authInstance.userHasAccess(CartRoutes.Roles), true),
			],
		});
		this.routes[`${ProductRoutes.Prefix}/*`] = wrap({
			component: Products,
			customData: null,
			conditions: [
				() => this.handleRouteNavigation(() => this.authInstance.userHasAccess(ProductRoutes.Roles), true),
			],
		});
		this.routes[`${JobRoutes.Prefix}/*`] = wrap({
			component: Jobs,
			customData: null,
			conditions: [
				() => this.handleRouteNavigation(() => this.authInstance.userHasAccess(JobRoutes.Roles), true),
			],
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
		this.routes[`${BillingRoutes.Prefix}/*`] = wrap({
			component: Billings,
			customData: null,
			conditions: [
				() => this.handleRouteNavigation(() => this.authInstance.userHasAccess(ReturnableRoutes.Roles), true),
			],
		});
		this.routes[`${ExpectedDeliveriesRoutes.Prefix}/*`] = wrap({
			component: ExpectedDeliveries,
			customData: null,
			conditions: [
				() =>
					this.handleRouteNavigation(
						() => this.authInstance.userHasAccess(ExpectedDeliveriesRoutes.Roles),
						true
					),
			],
		});
		this.routes[`${CatalogRoutes.Prefix}/*`] = wrap({
			component: Catalogs,
			customData: null,
			conditions: [
				() => this.handleRouteNavigation(() => this.authInstance.userHasAccess(CatalogRoutes.Roles), true),
			],
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
			conditions: [
				() => this.handleRouteNavigation(() => this.authInstance.userHasAccess(AccountRoutes.Roles), true),
			],
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
			conditions: [
				() => this.handleRouteNavigation(() => this.authInstance.userHasAccess(DeliveryRoutes.Roles), true),
			],
		});
		this.routes[`${RetrievalRoutes.Prefix}/*`] = wrap({
			component: Retrievals,
			customData: null,
			conditions: [
				() => this.handleRouteNavigation(() => this.authInstance.userHasAccess(RetrievalRoutes.Roles), true),
			],
		});
		this.routes[`${PurchaseOrderRoutes.Prefix}/*`] = wrap({
			component: PurchaseOrders,
			customData: null,
			conditions: [
				() =>
					this.handleRouteNavigation(() => this.authInstance.userHasAccess(PurchaseOrderRoutes.Roles), true),
			],
		});
		this.routes[`${MyOrderRoutes.Prefix}/*`] = wrap({
			component: MyOrders,
			customData: null,
			conditions: [
				() => this.handleRouteNavigation(() => this.authInstance.userHasAccess(MyOrderRoutes.Roles), true),
			],
		});
		this.routes[`${RecallRoutes.Prefix}/*`] = wrap({
			component: Recalls,
			customData: null,
			conditions: [
				() => this.handleRouteNavigation(() => this.authInstance.userHasAccess(RecallRoutes.Roles), true),
			],
		});
		this.routes[`${MyRecallRoutes.Prefix}/*`] = wrap({
			component: MyRecalls,
			customData: null,
			conditions: [
				() => this.handleRouteNavigation(() => this.authInstance.userHasAccess(MyRecallRoutes.Roles), true),
			],
		});
		this.routes[`${QuickOrderRoutes.Prefix}/*`] = wrap({
			component: QuickOrders,
			customData: null,
			conditions: [
				() => this.handleRouteNavigation(() => this.authInstance.userHasAccess(QuickOrderRoutes.Roles), true),
			],
		});
		this.routes[`${QuickPurchaseRoutes.Purchase.Path}`] = wrap({
			component: QuickFreePurchase,
			customData: null,
			conditions: [
				() => this.handleRouteNavigation(() => this.authInstance.userHasAccess(QuickOrderRoutes.Roles), true),
			],
		});
		this.routes[`${QuickPurchaseRoutes.Quick.Path}`] = wrap({
			component: QuickTemplatePurchase,
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
						() =>
							this.authInstance.userIsAnonymous() ||
							this.authInstance.userHasAccess(SearchProductRoutes.Roles),
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
						() =>
							this.authInstance.userIsAnonymous() ||
							this.authInstance.userHasAccess(DeliveryBatchesRoutes.Roles),
						true
					),
			],
		});
		this.routes[`${PickingRoutes.Prefix}/*`] = wrap({
			component: Pickings,
			customData: null,
			conditions: [
				() =>
					this.handleRouteNavigation(
						() =>
							this.authInstance.userIsAnonymous() || this.authInstance.userHasAccess(PickingRoutes.Roles),
						true
					),
			],
		});
		this.routes[`${BatchesRoutes.Prefix}/*`] = wrap({
			component: Batches,
			customData: null,
			conditions: [
				() =>
					this.handleRouteNavigation(
						() =>
							this.authInstance.userIsAnonymous() || this.authInstance.userHasAccess(BatchesRoutes.Roles),
						true
					),
			],
		});
		this.routes[`${StoreTraceabilityRoutes.Prefix}/*`] = wrap({
			component: StoreTraceability,
			customData: null,
			conditions: [
				() =>
					this.handleRouteNavigation(
						() =>
							this.authInstance.userIsAnonymous() ||
							this.authInstance.userHasAccess(StoreTraceabilityRoutes.Roles),
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
						() =>
							this.authInstance.userIsAnonymous() ||
							this.authInstance.userHasAccess(ExternalRoutes.Roles),
						true
					),
			],
		});
		this.routes[`${SearchStoreRoutes.Prefix}`] = wrap({
			component: SearchStores,
			customData: null,
			conditions: [
				() => this.handleRouteNavigation(() => this.authInstance.userHasAccess(SearchStoreRoutes.Roles)),
			],
		});
		this.routes[`${SearchProducerRoutes.Prefix}`] = wrap({
			component: SearchProducers,
			customData: null,
			conditions: [
				() => this.handleRouteNavigation(() => this.authInstance.userHasAccess(SearchProducerRoutes.Roles)),
			],
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
					this.routerInstance.replacePage(redirectRoute);
					return false;
				},
			],
		});

		this.initializedSub = authInitialized.subscribe((initialized) => {
			if (initialized && this.authInstance.authorized && !this.authInstance.registered)
				this.routerInstance.replacePage(RegisterRoutes.Choose);
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
				Path: PurchaseOrderRoutes.List.Path,
				Params: null,
			};
		}

		if (this.authInstance.isInRole([Roles.Store.Value])) {
			return {
				Path: QuickPurchaseRoutes.Purchase.Path,
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
			this.routerInstance.replacePage(RegisterRoutes.Choose);
			return false;
		}

		var result = exec();
		if (!result && autoRedirect) {
			this.routerInstance.replacePage(HomeRoutes.Prefix);
		}

		return result;
	}

	unregister() {
		if (this.initializedSub) this.initializedSub();
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

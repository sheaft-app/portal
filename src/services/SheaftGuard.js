import { wrap } from "svelte-spa-router";

import Home from "./../routes/home/Home.svelte";
import Cart from "./../routes/cart/Cart.svelte";
import Leaderboard from "./../routes/leaderboard/Leaderboard.svelte";
import Register from "./../routes/register/Register.svelte";
import PurchaseOrders from "./../routes/purchase-orders/PurchaseOrders.svelte";
import MyOrders from "./../routes/my-orders/MyOrders.svelte";
import Account from "./../routes/account/Account.svelte";
import Sponsorship from "./../routes/sponsorship/Sponsorship.svelte";
import SellingPoints from "./../routes/selling-points/SellingPoints.svelte";
import Deliveries from "./../routes/deliveries/Deliveries.svelte";
import Returnables from "./../routes/returnables/Returnables.svelte";
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

import ProductRoutes from "./../routes/products/routes.js";
import JobRoutes from "./../routes/jobs/routes.js";
import SearchStoreRoutes from "./../routes/search-stores/routes.js";
import SearchProducerRoutes from "./../routes/search-producers/routes.js";
import AgreementRoutes from "./../routes/agreements/routes.js";
import ReturnableRoutes from "./../routes/returnables/routes.js";
import SponsorshipRoutes from "./../routes/sponsorship/routes.js";
import LeaderboardRoutes from "./../routes/leaderboard/routes.js";
import RegisterRoutes from "./../routes/register/routes.js";
import CartRoutes from "./../routes/cart/routes.js";
import AccountRoutes from "./../routes/account/routes.js";
import SearchProductRoutes from "./../routes/search-products/routes.js";
import PurchaseOrderRoutes from "./../routes/purchase-orders/routes.js";
import MyOrderRoutes from "./../routes/my-orders/routes.js";
import SellingPointRoutes from "./../routes/selling-points/routes.js";
import DeliveryRoutes from "./../routes/deliveries/routes.js";
import QuickOrderRoutes from "./../routes/quick-orders/routes.js";
import OidcRoutes from "./../routes/oidc/routes.js";
import HomeRoutes from "./../routes/home/routes.js";
import Roles from "./../enums/Roles";
import { authAuthenticated, authRegistered, authAuthorized } from "../stores/auth";

class SheaftGuard {
	constructor(authInstance, routerInstance) {
		this.authInstance = authInstance;
		this.routerInstance = routerInstance;

		this.routes = {};

		this.routes[`${RegisterRoutes.Prefix}/*`] = wrap(Register, null, () => this.handleRouteNavigation(() => this.authInstance.userIsLoggedIn() && !this.authInstance.userIsRegistered(), true));	
		this.routes[`${CartRoutes.Prefix}/*`] = wrap(Cart, null, () => this.handleRouteNavigation(() => this.authInstance.userHasAccess(CartRoutes.Roles)));
		this.routes[`${ProductRoutes.Prefix}/*`] = wrap(Products, null, () => this.handleRouteNavigation(() => this.authInstance.userHasAccess(ProductRoutes.Roles)));
		this.routes[`${JobRoutes.Prefix}/*`] = wrap(Jobs, null, () => this.handleRouteNavigation(() => this.authInstance.userHasAccess(JobRoutes.Roles)));
		this.routes[`${AgreementRoutes.Prefix}/*`] = wrap(Agreements, null, () => this.handleRouteNavigation(() => this.authInstance.userHasAccess(AgreementRoutes.Roles)));
		this.routes[`${ReturnableRoutes.Prefix}/*`] = wrap(Returnables, null, () => this.handleRouteNavigation(() => this.authInstance.userHasAccess(ReturnableRoutes.Roles)));
		this.routes[`${SponsorshipRoutes.Prefix}/*`] = wrap(Sponsorship, null, () => this.handleRouteNavigation(() => this.authInstance.userHasAccess(SponsorshipRoutes.Roles)));
		this.routes[`${AccountRoutes.Prefix}/*`] = wrap(Account, null, () => this.handleRouteNavigation(() => this.authInstance.userHasAccess(AccountRoutes.Roles)));
		this.routes[`${SellingPointRoutes.Prefix}/*`] = wrap(SellingPoints, null, () => this.handleRouteNavigation(() => this.authInstance.userHasAccess(SellingPointRoutes.Roles)));
		this.routes[`${DeliveryRoutes.Prefix}/*`] = wrap(Deliveries, null, () => this.handleRouteNavigation(() => this.authInstance.userHasAccess(DeliveryRoutes.Roles)));
		this.routes[`${PurchaseOrderRoutes.Prefix}/*`] = wrap(PurchaseOrders, null, () => this.handleRouteNavigation(() => this.authInstance.userHasAccess(PurchaseOrderRoutes.Roles)));
		this.routes[`${MyOrderRoutes.Prefix}/*`] = wrap(MyOrders, null, () => this.handleRouteNavigation(() => this.authInstance.userHasAccess(MyOrderRoutes.Roles)));
		this.routes[`${QuickOrderRoutes.Prefix}/*`] = wrap(QuickOrders, null, () => this.handleRouteNavigation(() => this.authInstance.userHasAccess(QuickOrderRoutes.Roles)));

		this.routes[`${LeaderboardRoutes.Prefix}`] = wrap(Leaderboard, null, () => this.handleRouteNavigation(() => this.authInstance.userIsAnonymous() || this.authInstance.userIsRegistered()));
		this.routes[`${SearchProductRoutes.Prefix}`] = wrap(SearchProducts, null, () => this.handleRouteNavigation(() => this.authInstance.userIsAnonymous() || this.authInstance.userHasAccess(SearchProductRoutes.Roles), true));
			
		this.routes[`${SearchStoreRoutes.Prefix}`] = wrap(SearchStores, null, () => this.handleRouteNavigation(() => this.authInstance.userHasAccess(SearchStoreRoutes.Roles)));
		this.routes[`${SearchProducerRoutes.Prefix}`] = wrap(SearchProducers, null, () => this.handleRouteNavigation(() => this.authInstance.userHasAccess(SearchProducerRoutes.Roles)));

		this.routes[`${OidcRoutes.Callback.Path}`] = Callback;
		this.routes[`${OidcRoutes.CallbackSilent.Path}`] = CallbackSilent;
		this.routes[`${HomeRoutes.Unauthorized.Path}`] = Unauthorized;
		this.routes[`${HomeRoutes.Error.Path}`] = ServerError;
		this.routes[`${HomeRoutes.NotFound.Path}`] = NotFound;
		
		this.routes['*'] = wrap(Home, null, () => { 
			if(this.routerInstance.currentUrl.indexOf(RegisterRoutes.Prefix) > -1)
				return false;

			var redirectRoute = this.getRedirectRoute();
			this.routerInstance.goTo(redirectRoute, null, true);
			return false;
		});

		this.authorizedSub = authAuthorized.subscribe((authorized)=> {
			if(authorized && !this.authInstance.registered)
				this.routerInstance.goTo(RegisterRoutes.Choose);
		});
	}

	getRedirectRoute() {
		if (this.authInstance.isInRole([Roles.Producer.Value]))
		{
			return {
				Path: ProductRoutes.List.Path,
				Params: null
			}
		}

		if (this.authInstance.isInRole([Roles.Store.Value]))
		{
			return {
				Path: QuickOrderRoutes.Purchase.Path,
				Params: null
			}
		}

		return {
			Path: SearchProductRoutes.Prefix,
			Params: {
				Query: {
					sort: SearchProductRoutes.Search.Params.Query.sort
				}
			}
		}
	}

	handleRouteNavigation = (exec, autoRedirect) => {
		if(this.authInstance.authorized && !this.authInstance.registered && this.routerInstance.currentUrl.indexOf(RegisterRoutes.Prefix) < 0){
			this.routerInstance.goTo(RegisterRoutes.Choose, null, true);
			return false;
		}

		var result = exec();
		if(!result && autoRedirect){	
			this.routerInstance.goTo(HomeRoutes.Prefix, null, true);
		}
		
		return result;
	}

	unregister() {
		this.authorizedSub.unsubscribe();
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

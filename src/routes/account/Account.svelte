<script>
	import Router from "svelte-spa-router";

	import Profile from "./Profile.svelte";
	import AccountRoutes from "./routes.js";
	import Meta from "../../components/Meta.svelte";

	export let params = {};

	export const prefix = AccountRoutes.Prefix;

	const routes = {};
	routes[AccountRoutes.Profile.SubPart] = Profile;
</script>

<Meta />

<Router {routes} {prefix} />

<style lang="scss">
	.account-menu div {
		@apply mb-6;
		@apply py-2;

		a {
			@apply rounded;
			@apply cursor-pointer;

			&:hover {
				color: #7dd6ba;
			}

			&.active {
				@apply text-white;
				background: linear-gradient(90deg, #33d7c3 0%, #33d7a3 100%);
			}
		}
	}
</style>

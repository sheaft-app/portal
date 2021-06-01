<script>
	import { location } from "svelte-spa-router";
	import Icon from "svelte-awesome";
	import { navExpended } from "./store.js";
	import GetRouterInstance from "./../../services/SheaftRouter";

	export let route;
	const routerInstance = GetRouterInstance();

	const navigate = () => {
		navExpended.set(false);
		routerInstance.goTo(route);
	};

	$: isActive = (str) => {
		return $location.indexOf(str.split("?")[0]) > -1;
	};

</script>

<li>
	<a href="javascript:void(0)" on:click={navigate} class:active={isActive(route.Path)} class="nav-link">
		<div>
			<Icon data={route.Icon} class="mr-3 inline svg" style="width: 14px; height:16px;" />
			<span style="font-size: .9em;">{route.Name}</span>
		</div>
	</a>
</li>

<style lang="scss">
	a.nav-link {
		display: block;
		font-size: 0.9em;
		width: 100%;
		padding: 8px 0px;
		transition: background-color linear 0.2s;

		&:hover {
			background-color: darken(#fafafa, 5);
		}
	}

	a.nav-link:not(.active) {
		color: #205164;
	}

	a.active {
		@apply font-semibold;
	}

	a.nav-link,
	.reset-button {
		position: relative;
		text-decoration: none;
		width: 100%;
		height: 100%;
		text-transform: uppercase;

		> div {
			padding: 5px 15px;
		}

		.fa-angle-left {
			position: absolute;
			top: 50%;
			transform: translateY(-50%) rotate(0deg);
			right: -34px + 15px;
			width: 6px;
			transition: transform 0.2s linear;
		}
		&.expanded {
			.fa-angle-left {
				transform: translateY(-50%) rotate(-90deg);
			}

			+ ul {
				display: block;
			}
		}
	}

</style>

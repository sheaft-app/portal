<script lang="ts">
	import AcceptCookiePlaceholder from "./components/modal/AcceptCookiePlaceholder.svelte";
	import { allDepartmentsProgress } from "./stores/app";
	import cart from "./stores/cart";
	import { authRegistered } from "./stores/auth";
	import { onMount, onDestroy, getContext } from "svelte";
	import "notyf/notyf.min.css";
	import Router from "svelte-spa-router";
	import "swiper/swiper.min.css";
	import "swiper/components/navigation/navigation.min.css";
	import Modal from "./components/modal/Modal.svelte";
	import Nav from "./components/nav/Nav.svelte";
	import { selectedItem, fullScreenMap } from "./stores/app.js";
	import { authInitialized, authAuthenticated } from "./stores/auth.js";
	import { navExpended } from "./components/nav/store.js";
	import { config } from "./configs/config.js";
	import Tailwindcss from "./components/Tailwind.svelte";
	import Roles from "./enums/Roles";
	import { loginFreshdesk, logoutFreshdesk } from "./services/SheaftFreshdesk.js";
	import OidcRoutes from "./routes/oidc/routes";
	import { notificationsCount } from "./components/notifications/store";
	import { GET_UNREAD_NOTIFICATIONS_COUNT } from "./components/notifications/queries";
	import mangoPay from "./../node_modules/mangopay-cardregistration-js-kit/kit/mangopay-kit.min.js";
	import "cropperjs/dist/cropper.min.css";

	export let authInstance;
	export let errorsHandlers;
	export let guardInstance;
	export let routerInstance;
	export let signalrInstance;

	mangoPay.cardRegistration.baseURL = config.psp.url;
	mangoPay.cardRegistration.clientId = config.psp.clientId;

	const { query, mutate } = getContext("api");

	let isLoading = true;

	if ("serviceWorker" in navigator) {
		navigator.serviceWorker.register("./sw.js", { scope: "./" });
	}

	const initSubscription = authInitialized.subscribe(async (initialized) => {
		if (initialized) {
			isLoading = false;

			if (!authInstance.isInRole([Roles.Store.Value, Roles.Producer.Value]))
				await cart.initialize({ query, mutate }, errorsHandlers, authInstance.authenticated);
		}
	});

	const authSubscription = authAuthenticated.subscribe(async (authenticated) => {
		if (!authenticated) {
			await logoutFreshdesk();
			signalrInstance.stop();
		} else {
			signalrInstance.start();
			await loginFreshdesk();

			if (!authInstance.isInRole([Roles.Store.Value, Roles.Producer.Value]))
				await cart.initialize({ query, mutate }, errorsHandlers, authInstance.authenticated);

			await query({
				query: GET_UNREAD_NOTIFICATIONS_COUNT,
				errorsHandler: errorsHandlers,
				success: (res) => notificationsCount.set(res),
			});

			if (
				routerInstance.currentUrl === OidcRoutes.Callback.Path ||
				routerInstance.currentUrl === OidcRoutes.CallbackSilent.Path
			)
				await routerInstance.replacePage("/");
		}
	});

	(window as any).mobileAndTabletCheck = function () {
		let check = false;
		(function (a) {
			if (
				/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(
					a
				) ||
				/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
					a.substr(0, 4)
				)
			)
				check = true;
		})(navigator.userAgent || navigator.vendor || (window as any).opera);
		return check;
	};

	onMount(async () => {
		isLoading = true;

		let sponsoring = routerInstance.getQueryParam("user_sponsoring");
		if (sponsoring) {
			localStorage.setItem("user_sponsoring", JSON.stringify(sponsoring));
		} else {
			localStorage.removeItem("user_sponsoring");
		}

		let role = routerInstance.getQueryParam("role");
		if (role) {
			localStorage.setItem("user_choosen_role", JSON.stringify(role.toUpperCase()));
			await authInstance.login();
		}

		const progress = await fetch(config.content + "/progress/departments.json");
		let data = await progress.json();

		allDepartmentsProgress.set(data);

		isLoading = false;
	});

	onDestroy(async () => {

		if (authSubscription) authSubscription();

		if (initSubscription) initSubscription();

		if (authInstance) authInstance.unregister();

		if (routerInstance) routerInstance.unregister();

		if (guardInstance) guardInstance.unregister();

		if (signalrInstance) await signalrInstance.stop();
	});
</script>

{#if !$authInitialized || isLoading}
	<div class="h-full flex text-center items-center justify-center bg-primary">
		<div class="text-center">
			<svg
				id="FEUILLES_V3"
				data-name="FEUILLES V3"
				xmlns="http://www.w3.org/2000/svg"
				style="height:150px;width:auto;"
				viewBox="0 0 217.22 220.01"
			>
				<defs>
					<style>
						.cls-1,
						.cls-4 {
							fill: none;
						}

						.cls-1,
						.cls-3,
						.cls-4 {
							stroke: #fff;
							stroke-linecap: round;
						}

						.cls-1 {
							stroke-miterlimit: 10;
							stroke-width: 12px;
						}

						.cls-2,
						.cls-3 {
							fill: #fff;
						}

						.cls-3,
						.cls-4 {
							stroke-linejoin: round;
							stroke-width: 3px;
						}
					</style>
				</defs>
				<title>FAVICON_SHEAFT_V1_white</title>
				<g id="FRAISE">
					<path class="cls-1" d="M132,162.12s52.52-.66,72.3-48.83c12.54-30.51,5.76-73.38-1.9-99.37" />
					<path
						class="cls-1"
						d="M201.32,11.68c-26.91-4.35-73.44-12-102.39,4.1C53.22,41.2,49.87,96,49.87,96"
					/>
					<circle class="cls-2" cx="175.01" cy="33.92" r="7.15" />
					<circle class="cls-2" cx="132.75" cy="89.66" r="7.15" />
					<circle class="cls-2" cx="164.44" cy="113.51" r="7.15" />
					<circle class="cls-2" cx="87.87" cy="82.5" r="7.15" />
					<circle class="cls-2" cx="113.51" cy="41.08" r="7.15" />
					<circle class="cls-2" cx="182.16" cy="75.35" r="7.15" />
					<circle class="cls-2" cx="113.51" cy="133.66" r="7.15" />
				</g>
				<path
					class="cls-3"
					d="M20.69,218.51c-6-73.94,41.35-65.24,51.15-62.67,1.12.29-21.12,13-4.84,39C77.41,211.43,27.35,207.26,20.69,218.51Z"
				/>
				<path class="cls-3" d="M7.2,97.41c-.91,43.29,34,25.45,34,25.45C24.48,120.72,13.46,104.07,7.2,97.41Z" />
				<path
					class="cls-2"
					d="M89.25,209.55c-40.95-31.1-10.85-52-10.85-52C109.46,173.75,85,198.13,89.25,209.55Z"
				/>
				<path
					class="cls-4"
					d="M1.5,162.34c36.09-45.51,58.21-9.16,58.21-9.16C40.57,188.18,14.35,158.14,1.5,162.34Z"
				/>
				<path
					class="cls-2"
					d="M122.67,207.88c-30.45-12-13.73-29.82-13.73-29.82C131.09,182.69,118.44,201.65,122.67,207.88Z"
				/>
			</svg>
			<div class="text-white font-bold" style="font-size:3em">SHEAFT</div>
		</div>
	</div>
{:else}
	{#if $selectedItem}
		<div
			on:click={() => selectedItem.set(null)}
			class="cursor-pointer w-full h-full opacity-50 bg-black fixed hidden
      lg:block"
			style="z-index: 7;"
		/>
	{/if}
	<Nav />
	<AcceptCookiePlaceholder />
	<main
		class:relative={!$navExpended}
		class:fixed={$navExpended}
		class:reset-margin={!$authRegistered || authInstance.isInRole([Roles.Consumer.Value]) || $fullScreenMap}
	>
		<Modal>
			<div
				class={`${$fullScreenMap ? "" : "p-4 md:px-6 md:py-4 lg:px-8 lg:py-4"} h-full`}
				id="main-content"
				class:noNav={!$authRegistered || $fullScreenMap}
			>
				<Router routes={guardInstance.routes} />
			</div>
		</Modal>
	</main>
{/if}

<Tailwindcss />

<style global lang="scss">
	svg {
		display: inline !important;
	}

	@media (max-width: 374px) {
		.distance-badge-content svg {
			display: none !important;
		}
	}

	input:required {
		box-shadow: none;
	}

	input:invalid {
		box-shadow: none;
	}

	.text-normal {
		color: #205164;
	}

	.text-primary {
		color: #009688;
	}

	.text-accent {
		color: #ff4081;
	}

	.bg-accent {
		background-color: #ff4081;
		color: #ffffff;

		&:hover,
		&:focus {
			background-color: #ff4081 !important;
			color: #ffffff !important;
		}
	}

	.border-normal {
		border-color: #205164;
	}

	.border-accent {
		border-color: #ff4081;
	}

	.progressbar {
		width: 100%;
		max-width: 130px;
	}

	body {
		margin: 0;
		font-family: Roboto, -apple-system, BlinkMacSystemFont, Segoe UI, Oxygen, Ubuntu, Cantarell, Fira Sans,
			Droid Sans, Helvetica Neue, sans-serif;
		font-size: 14px;
		line-height: 1.5;
		color: #205164;
	}

	h1,
	h2,
	h3,
	h4,
	h5,
	h6 {
		margin: 0 0 0.5em 0;
		font-weight: 400;
		line-height: 1.2;
		color: #205164;
	}

	.back-bg-clr {
		background-color: #fbfbfb !important;
	}

	.bg-primary {
		background: #009688;
		color: #ffffff !important;
	}

	.bg-light-primary {
		background: #b2dfdb;
	}

	.input-bg-clr {
		background-color: #fbfbfb;
	}

	.input-bd-clr {
		border-color: #e2e2e2;
	}

	main a,
	main .btn-link {
		color: #ff4081;
		cursor: pointer;
	}

	code {
		font-family: menlo, inconsolata, monospace;
		font-size: calc(1em - 2px);
		color: #555;
		background-color: #f0f0f0;
		padding: 0.2em 0.4em;
		border-radius: 2px;
	}

	@media (min-width: 400px) {
		body {
			font-size: 16px;
		}
	}

	/* Override des styles de Notyf */

	.success-color {
		color: #45ad43 !important;
	}

	.error-color {
		color: #ff5656 !important;
	}

	.warning-color {
		color: #fa9d45 !important;
	}

	.info-color {
		color: #389fcf !important;
	}

	.hold-color {
		color: #eee236 !important;
	}

	.help-color {
		color: #7159db !important;
	}

	.progress-color {
		color: #3fb8bd !important;
	}

	.accent-color {
		color: #ff4081 !important;
	}

	.primary-color {
		color: #009688 !important;
	}

	@media (min-width: 1024px) {
		.notyf__toast {
			max-width: 400px !important;
		}
	}

	.notyf__toast {
		background-color: #ffffff !important;
		@apply border;
		@apply border-gray-200;
		@apply shadow-xl;
	}

	.notyf__toast--upper {
		margin-bottom: 0 !important;
	}

	.notyf__wrapper {
		align-items: flex-start !important;
	}

	.notyf__icon {
		margin-right: 20px !important;
	}

	.notyf__dismiss-btn {
		background-color: #ffffff !important;

		&:before,
		&:after {
			background: #333333 !important;
		}
	}

	.notyf {
		padding-top: 85px;
	}

	@media (max-width: 1023px) {
		.notyf {
			padding-top: 45px;
		}
	}

	.material-icons {
		margin-top: 0;
		padding-right: 10px;
	}

	textarea.disabled,
	input.disabled,
	div.disabled,
	button.disabled {
		background: #e8e8e8 !important;
		color: #7b7b7b !important;
		cursor: not-allowed !important;
		transition: none !important;
	}

	.leaflet-popup-content-wrapper {
		@apply rounded-sm;
	}

	.leaflet-popup {
		bottom: 0 !important;
	}

	.leaflet-popup-content-wrapper {
		background-color: #009688;
		color: #ffffff;
	}

	.leaflet-popup-close-button {
		color: #ffffff !important;
	}

	.leaflet-popup-tip {
		background-color: #009688;
	}

	.custom-marker {
		@apply rounded;
		@apply text-gray-700;
		@apply font-bold;
		@apply flex;
		@apply items-center;
		@apply justify-center;
		width: 25px !important;
		height: 20px !important;
	}

	.custom-marker-me {
		@apply border-none;
		width: 24px !important;
		height: 24px !important;
		z-index: 118 !important;
	}

	.no-padding {
		padding: 0 !important;
	}

	h1 {
		@apply text-2xl;
	}

	h2 {
		font-size: 1.8em;
		margin-bottom: 10px;
	}

	a {
		color: #ff4081;
	}

	.btn {
		@apply rounded-full;
		@apply flex;
		@apply items-center;
		@apply transition;
		@apply duration-300;
		@apply ease-in-out;

		&-link {
			color: #ff4081;
		}

		&-primary {
			background: #009688;
			@apply text-white;
		}

		&-outline {
			@apply border;
			border-color: #ff4081;
			color: #ff4081;
			background-color: transparent;
			box-shadow: none;

			&:hover {
				@apply btn-accent;
			}
		}

		&.disabled {
			border: none;
		}

		&-accent {
			background: #ff4081;
			border: 1px solid #ff4081;
			@apply text-white;

			&:hover {
				@apply bg-white;
				color: #ff4081;
			}
		}

		&-white {
			background: #ffffff;
			@apply shadow;
			color: #205164;
		}

		&-lg {
			@apply px-6;
			@apply py-2;

			@media (max-width: 1024px) {
				@apply px-5;
			}
		}

		&-xl {
			@apply px-10;
			@apply py-3;
			@apply text-lg;
			@apply font-semibold;

			@media (max-width: 1024px) {
				@apply px-5;
				@apply py-2;
			}
		}
	}

	button {
		&.disabled {
			background-color: #f7f7f7;
			color: #a5a5a5;
			@apply cursor-not-allowed;

			&:hover {
				background-color: #cccccc;
				@apply text-white;
			}
		}

		&:focus {
			outline: none !important;
		}
	}

	.button-group {
		@apply inline-flex;
		border: 1px solid #cbd5e0;
		@apply rounded;

		button {
			@apply bg-white;
			@apply w-full;
			@apply font-semibold;
			@apply py-2;
			@apply px-4;
			@apply justify-center;

			&:hover {
				@apply bg-gray-200;
			}

			&.selected {
				@apply bg-accent;
			}

			&:first-child {
				@apply rounded-l;
			}

			&:last-child {
				@apply rounded-r;
			}

			&:not(:last-child) {
				border-right: 1px solid #cbd5e0;
			}
		}
	}

	.details-panel {
		width: 350px;
	}

	.form-control {
		@apply flex;
		@apply flex-wrap;
		@apply mb-3;

		label {
			@apply block;
			@apply uppercase;
			@apply tracking-wide;
			@apply text-normal;
			@apply text-xs;
			@apply font-bold;
			@apply mb-2;
		}
	}

	input,
	select,
	textarea {
		@apply bg-white;
		@apply border;
		@apply border-gray-400;
		@apply border-solid;
		@apply py-3;
		@apply px-4;
		@apply font-semibold;
		@apply leading-tight;
		@apply block;
		@apply w-full;
		@apply rounded-sm;

		&::-webkit-input-placeholder,
		&::-moz-placeholder,
		&:-ms-input-placeholder,
		&::placeholder {
			@apply font-normal;
			@apply text-gray-600;
		}

		&:focus,
		&:hover {
			@apply outline-none;
			@apply border-gray-500;
		}
	}

	.invalid {
		border: 1px solid red !important;
	}

	input[type="radio"] {
		@apply w-auto;
		@apply inline-block;
	}

	main {
		top: 45px;
		height: calc(100% - 45px);
	}

	@media (min-width: 1024px) {
		main {
			top: 64px;
			margin-left: 200px; // la taille de la nav de gauche
			height: calc(100% - 64px);
		}
	}

	.reset-margin {
		margin-left: 0 !important;
	}

	@media (max-width: 768px) {
		.details-panel {
			margin-top: 40px;

			&.active {
				width: 100%;
			}
		}
	}

	.skeleton-box {
		position: relative;
		overflow: hidden;
		background-color: #e2e8f0 !important;

		&::after {
			position: absolute;
			top: 0;
			right: 0;
			bottom: 0;
			left: 0;
			transform: translateX(-100%);
			background-image: linear-gradient(
				90deg,
				rgba(255, 255, 255, 0) 0,
				rgba(255, 255, 255, 0.2) 20%,
				rgba(255, 255, 255, 0.5) 60%,
				rgba(255, 255, 255, 0)
			);
			animation: shimmer 1s infinite;
			content: "";
		}
	}

	@keyframes shimmer {
		100% {
			transform: translateX(100%);
		}
	}

	.mobile-overflow-hidden {
		@media (min-width: 1023px) {
			width: calc(100% - 200px);
		}

		@media (max-width: 1024px) {
			overflow: hidden;
		}
	}

	.noNav {
		width: 100% !important;
	}

	.blink {
		animation: blinker 1s linear 3;
	}

	@keyframes blinker {
		50% {
			background-color: rgb(255, 169, 169);
		}
	}

	.svelte-tabs__tab-list {
		border-top: 1px solid #cccccc;
		text-transform: uppercase;
		border-bottom: none !important;
	}

	.svelte-tabs__tab-list li.svelte-tabs__tab {
		color: #989898;

		&:focus {
			background-color: #ffecf2;
			outline: thin;
		}
	}

	.svelte-tabs__tab-list li.svelte-tabs__selected {
		border-bottom: none;
		border-top: 2px solid #ff4081;
		color: #ff4081;
	}

	.swiper-button-next {
		background-color: #ff3f80;
		border-radius: 50px;
		padding: 22px;
		color: #ffffff;

		&::after {
			font-size: 1.2rem;
		}
	}

	.swiper-button-prev {
		background-color: #ff3f80;
		border-radius: 50px;
		padding: 22px;
		color: #ffffff;

		&::after {
			font-size: 1.2rem;
		}
	}

	.scal-trigger {
		width: fit-content;
	}

	[data-tooltip] {
		position: relative;
		z-index: 2;
		display: block;
	}

	[data-tooltip]:before,
	[data-tooltip]:after {
		visibility: hidden;
		opacity: 0;
		pointer-events: none;
		transition: 0.2s ease-out;
		transform: translate(-50%, 5px);
	}

	[data-tooltip]:before {
		position: absolute;
		bottom: 100%;
		left: 50%;
		margin-bottom: 5px;
		padding: 7px;
		width: 100%;
		min-width: 70px;
		max-width: 250px;
		-webkit-border-radius: 3px;
		-moz-border-radius: 3px;
		border-radius: 3px;
		background-color: #000;
		background-color: hsla(0, 0%, 20%, 0.9);
		color: #fff;
		content: attr(data-tooltip);
		text-align: center;
		font-size: 14px;
		line-height: 1.2;
		transition: 0.2s ease-out;
	}

	[data-tooltip]:after {
		position: absolute;
		bottom: 100%;
		left: 50%;
		width: 0;
		border-top: 5px solid #000;
		border-top: 5px solid hsla(0, 0%, 20%, 0.9);
		border-right: 5px solid transparent;
		border-left: 5px solid transparent;
		content: " ";
		font-size: 0;
		line-height: 0;
	}

	[data-tooltip]:hover:before,
	[data-tooltip]:hover:after {
		visibility: visible;
		opacity: 1;
		transform: translate(-50%, 0);
	}
	[data-tooltip="false"]:hover:before,
	[data-tooltip="false"]:hover:after {
		visibility: hidden;
		opacity: 0;
	}
	.bottom-cta {
		left: 0;
		bottom: 0;
		padding-bottom: 20px;
		padding-top: 20px;
		background-color: #fbfbfb;
		margin: 0 auto;
		text-align: center;
		@apply fixed;
		@media (min-width: 1024px) {
			@apply absolute;
		}
	}
</style>

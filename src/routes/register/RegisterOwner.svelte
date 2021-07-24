<script>
	import Loader from "./../../components/Loader.svelte";
	import { REGISTER_STORE, REGISTER_PRODUCER } from "./mutations.js";
	import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
	import GetAuthInstance from "./../../services/SheaftAuth";
	import SheaftErrors from "./../../services/SheaftErrors";
	import { onDestroy, getContext } from "svelte";
	import Roles from "./../../enums/Roles";
	import ErrorCard from "../../components/ErrorCard.svelte";
	import FormSiret from "./owner/FormSiret.svelte";
	import FormOwner from "./owner/FormOwner.svelte";
	import FormCompany from "./owner/FormCompany.svelte";
	import FormBusinessHours from "./owner/FormBusinessHours.svelte";
	import FormProductionSite from "./owner/FormProductionSite.svelte";
	import { authUserAccount } from "./../../stores/auth.js";
	import { company, normalizeCompany, normalizeStore, stepper } from "./registerCompanyForm";

	export let params = {};

	const authInstance = GetAuthInstance();
	const { mutate } = getContext("api");
	const errorsHandler = new SheaftErrors();

	let sub = null;
	let isRegistering = false;
	let siretWasNotFound = false;

	const handleSubmit = async () => {
		isRegistering = true;
		await mutate({
			mutation: isStore ? REGISTER_STORE : REGISTER_PRODUCER,
			variables: isStore ? normalizeStore($authUserAccount.profile) : normalizeCompany($authUserAccount.profile),
			success: async () => {
				localStorage.removeItem("user_choosen_role");
				localStorage.removeItem("user_sponsoring");
				localStorage.removeItem("user");
				await authInstance.refreshLogin("/");
			},
			errorsHandler,
			error: () => {
				isRegistering = false;
			},
			errorNotification: "Impossible de créer votre compte. Veuillez réessayer ou contacter le support",
			successNotification: "Votre compte a bien été créé !",
		});
	};

	onDestroy(() => {
		if (sub != null) sub.unsubscribe();
	});

	$: isStore = params.id == Roles.Store.Value;
</script>

<svelte:head>
	<title>Enregistrement société</title>
</svelte:head>

<TransitionWrapper classNames="m-auto">
	<!-- hack avec h-full pour éviter que le citysearch dépasse du cadre -->
	<div class="-my-2 -mx-4 py-2 overflow-x-auto mt-2 mb-8" class:h-full={$stepper == 4}>
		<ErrorCard {errorsHandler} />
		<div class="w-full md:w-3/5 lg:w-4/5 m-auto">
			{#if isRegistering}
				<Loader />
			{:else if $stepper <= 0}
				<FormSiret {errorsHandler} bind:siretWasNotFound />
			{:else if $stepper == 1}
				<FormCompany {isStore} {errorsHandler} {siretWasNotFound} />
			{:else if $stepper == 2}
				<FormOwner {errorsHandler} />
			{:else if $stepper == 3}
				<FormBusinessHours {isStore} />
			{:else if $stepper == 4}
				<FormProductionSite {isStore} submit={handleSubmit} />
			{/if}
		</div>
	</div>
</TransitionWrapper>

<style>
	img {
		height: 80px;
		width: 100%;
	}
</style>

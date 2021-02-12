<script>
	import DisplayStatusIcon from "./../../components/status/DisplayStatusIcon.svelte";
	import AgreementStatusKind from "./../../enums/AgreementStatusKind";
	import AgreementRoutes from './routes';
	import { format } from "date-fns";
	import GetRouterInstance from "../../services/SheaftRouter.js";
	import GetAuthInstance from "../../services/SheaftAuth.js";
	import fr from "date-fns/locale/fr";
	import Roles from "./../../enums/Roles";
	import Icon from "svelte-awesome";
	import { faChevronRight } from "@fortawesome/free-solid-svg-icons";

	export let agreement;

	const routerInstance = GetRouterInstance();
	const authManager = GetAuthInstance();
</script>

<div
	class="px-6 py-6 md:mb-3 bg-white md:shadow md:border-none border-b border-gray-400">
	<div class="flex flex-row items-center">
		<DisplayStatusIcon status={agreement.status} type="agreement" />
		<div class="ml-3 leading-tight">
			<p class="font-semibold text-{AgreementStatusKind.color(agreement.status)}">
			{#if agreement.status == AgreementStatusKind.WaitingForProducerApproval.Value && authManager.isInRole([Roles.Producer.Value])}
				Vous devez traiter cet accord
			{:else if agreement.status == AgreementStatusKind.WaitingForStoreApproval.Value && authManager.isInRole([Roles.Store.Value])}
				Vous devez traiter cet accord
			{:else}
				{AgreementStatusKind.label(agreement.status)}
			{/if}
			</p>
			{#if authManager.isInRole([Roles.Producer.Value])}
				<span class="text-lg font-medium">{agreement.store.name}</span>
			{:else}
				<span class="text-lg font-medium">{agreement.delivery.producer.name}</span>
			{/if}
		</div>
	</div>
	<div class="text-base flex mt-5 flex-row mb-1">
		<p class="text-gray-600 w-full">Demandé le</p>
		<p class="text-normal font-semibold w-full">{format(new Date(agreement.createdOn), 'PP', { locale: fr })}</p>
	</div>
	<div class="mt-3">
		<a href="javascript:void(0)"
			class="btn px-3 py-1 bg-white text-accent shadow font-semibold hover:bg-gray-100"
			style="width: max-content"
			on:click="{() => routerInstance.goTo(AgreementRoutes.Details, { id: agreement.id })}">
			<Icon data={faChevronRight} class="mr-2 w-4 h-4" />
			Détails de l'accord
		</a>
	</div>
</div>

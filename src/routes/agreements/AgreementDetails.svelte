<script>
	import AgreementStatusKind from "./../../enums/AgreementStatusKind.js";
	import {onMount, getContext} from "svelte";
	import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
	import GetAuthInstance from "./../../services/SheaftAuth.js";
	import GetRouterInstance from "./../../services/SheaftRouter";
	import {GET_AGREEMENT_DETAILS} from "./queries";
	import CancelAgreementModal from "./CancelAgreementModal.svelte";
	import AcceptAgreementModal from "./AcceptAgreementModal.svelte";
	import RefuseAgreementModal from "./RefuseAgreementModal.svelte";
	import SheaftErrors from "../../services/SheaftErrors";
	import AgreementRoutes from "./routes";
	import Roles from "./../../enums/Roles";
	import {GetDistanceInfos} from "../../helpers/distances";
	import ProducerAgreement from "./ProducerAgreement.svelte";
	import StoreAgreement from "./StoreAgreement.svelte";
	import PageHeader from "../../components/PageHeader.svelte";
	import PageBody from "../../components/PageBody.svelte";

	export let params = {};

	const errorsHandler = new SheaftErrors();
	const authManager = GetAuthInstance();
	const routerInstance = GetRouterInstance();
	const {open} = getContext("modal");
	const { query } = getContext("api");

	let agreement = null;
	let distanceInfos = null;
	let isLoading = true;
	let loadingMessage = 'Chargement du partenariat en cours... veuillez patienter';

	const showCancelAgreementModal = () => {
		loadingMessage = 'Annulation du partenariat en cours... veuillez patienter';
		handleAgreementModal(CancelAgreementModal, agreement);
	};

	const showAcceptAgreementModal = () => {
		loadingMessage = 'Acceptation du partenariat en cours... veuillez patienter';
		handleAgreementModal(AcceptAgreementModal, agreement);
	};

	const showRefuseAgreementModal = () => {
		loadingMessage = 'Refus du partenariat en cours... veuillez patienter';
		handleAgreementModal(RefuseAgreementModal, agreement);
	};

	const handleAgreementModal = (Modal, obj) => open(Modal, {
		agreements: [obj],
		onClose: () => routerInstance.reload()
	});

	const isSender = agreement => {
		if (
			agreement.status == AgreementStatusKind.WaitingForProducerApproval.Value &&
			agreement.store.id == authManager.user.profile.id
		)
			return true;

		if (
			agreement.status == AgreementStatusKind.WaitingForStoreApproval.Value &&
			agreement.producer.id == authManager.user.profile.id
		)
			return true;

		return false;
	};

	onMount(async () => {
		loadingMessage = 'Chargement du partenariat en cours... veuillez patienter';
		isLoading = true;

		agreement = await query({
			query: GET_AGREEMENT_DETAILS,
			variables: {id: params.id},
			errorsHandler,
			success: (res) => distanceInfos = GetDistanceInfos(
				res.producer.address.latitude,
				res.producer.address.longitude,
				res.store.address.latitude,
				res.store.address.longitude
			),
			error: () => routerInstance.goTo(AgreementRoutes.List),
			errorNotification: "Le partenariat auquel vous essayez d'accéder n'existe plus."
		});
		isLoading = false;
	});
</script>

<TransitionWrapper>
	<PageHeader name="Détails du partenariat" previousPage={AgreementRoutes.List}/>
	<PageBody {errorsHandler} {isLoading} {loadingMessage}>
		<div class="w-full xl:w-8/12">
			{#if agreement.status == AgreementStatusKind.Accepted.Value}
				<div
					class="py-5 px-3 md:px-8 overflow-x-auto -mx-4 md:mx-0 bg-green-100 shadow
          md:rounded md:mb-2">
					<div>
						<p class="uppercase font-bold leading-none">Accord actif</p>
						<div class="mt-2">
							Cet accord est actif. Vous pouvez l'annuler à tout moment en
							cliquant sur le bouton ci-dessous.
						</div>
						<div class="mt-2">
							<a
								class="border btn btn-lg text-accent"
								style="width: max-content; border-color: #ff4081;"
								href="javascript:void(0)"
								on:click={showCancelAgreementModal}>
								Révoquer l'accord
							</a>
						</div>
					</div>
				</div>
			{/if}
			{#if agreement.status == AgreementStatusKind.Cancelled.Value}
				<div
					class="py-5 px-3 md:px-8 overflow-x-auto -mx-4 md:mx-0 bg-gray-100
          shadow md:rounded md:mb-2">
					<p class="uppercase font-bold leading-none">Accord annulé</p>
					<div class="mt-2">
						{#if agreement.reason}
							<p>Cet accord a été annulé pour la raison suivante :</p>
							<p class="mt-2 font-semibold">{agreement.reason}</p>
						{:else}
							<p>
								Cet accord a été annulé, vous ne pouvez plus interagir avec.
							</p>
						{/if}
					</div>
				</div>
			{/if}
			{#if agreement.status == AgreementStatusKind.Refused.Value}
				<div
					class="py-5 px-3 md:px-8 overflow-x-auto -mx-4 md:mx-0 bg-red-100
          shadow md:rounded md:mb-2">
					<p class="uppercase font-bold leading-none">Accord refusé</p>
					<div class="mt-2">
						{#if agreement.reason}
							<p>Cet accord a été refusé pour la raison suivante :</p>
							<p>{agreement.reason}</p>
						{:else}
							<p>Cet accord a été refusé.</p>
						{/if}
					</div>
				</div>
			{/if}
			{#if agreement.status.indexOf('WAITING') > -1}
				<div
					class="py-5 px-3 md:px-8 overflow-x-auto -mx-4 md:mx-0 bg-blue-100 shadow
          md:rounded md:mb-2">
					<p class="uppercase font-bold leading-none text-center">
						{isSender(agreement) ? `Cet accord est en attente de validation du ${authManager.isInRole(Roles.Producer.Value) ? 'magasin' : 'producteur'}.` : "Cet accord est en attente d'une réponse de votre part"}
					</p>
					{#if !isSender(agreement)}
						<div class="mt-6 flex justify-center items-center">
							<button
								on:click={showAcceptAgreementModal}
								class="btn btn-primary btn-lg shadow mr-2">
								Accepter
							</button>
							<button
								on:click={showRefuseAgreementModal}
								class="btn bg-red-500 text-white btn-lg shadow">
								Refuser
							</button>
						</div>
					{/if}
				</div>
			{/if}
			{#if authManager.isInRole(Roles.Store.Value)}
				<ProducerAgreement agreement={agreement} {distanceInfos}/>
			{:else}
				<StoreAgreement agreement={agreement} {distanceInfos}/>
			{/if}
		</div>
	</PageBody>
</TransitionWrapper>

<script>
	import {slide} from "svelte/transition";
	import DayOfWeekKind from "./../../enums/DayOfWeekKind.js";
	import AgreementStatusKind from "./../../enums/AgreementStatusKind.js";
	import Loader from "./../../components/Loader.svelte";
	import {onMount, getContext} from "svelte";
	import Icon from "svelte-awesome";
	import {
		faChevronDown,
		faChevronUp,
		faMapMarkerAlt,
		faPhone,
		faEnvelope,
		faChevronLeft
	} from "@fortawesome/free-solid-svg-icons";
	import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
	import GetGraphQLInstance from "./../../services/SheaftGraphQL.js";
	import GetAuthInstance from "./../../services/SheaftAuth.js";
	import GetRouterInstance from "./../../services/SheaftRouter";
	import {GET_AGREEMENT_DETAILS} from "./queries";
	import RatingStars from "./../../components/rating/RatingStars.svelte";
	import CancelAgreementModal from "./CancelAgreementModal.svelte";
	import AcceptAgreementModal from "./AcceptAgreementModal.svelte";
	import RefuseAgreementModal from "./RefuseAgreementModal.svelte";
	import SheaftErrors from "../../services/SheaftErrors";
	import ErrorCard from "./../../components/ErrorCard.svelte";
	import AgreementRoutes from "./routes";
	import {groupBy, timeSpanToFrenchHour} from "./../../helpers/app";
	import Roles from "./../../enums/Roles";
	import ProducerOtherProducts from "../../components/ProducerOtherProducts.svelte";
	import {GetDistanceInfos} from "../../helpers/distances";
	import ProducerAgreement from "./ProducerAgreement.svelte";
	import StoreAgreement from "./StoreAgreement.svelte";

	export let params = {};

	const errorsHandler = new SheaftErrors();
	const authManager = GetAuthInstance();
	const graphQLInstance = GetGraphQLInstance();
	const routerInstance = GetRouterInstance();
	const {open} = getContext("modal");

	let agreement = null;
	let products = [];
	let deliveryHours = [];
	let distanceInfos = null;
	let producerDescriptionExpanded = false;
	let user = null;

	const getAgreement = async id => {
		var res = await graphQLInstance.query(GET_AGREEMENT_DETAILS, {
			id: id
		}, errorsHandler.Uuid);

		if (!res.success) {
			//TODO
			routerInstance.goTo(AgreementRoutes.List);
			return;
		}

		distanceInfos = GetDistanceInfos(
			res.data.producer.address.latitude,
			res.data.producer.address.longitude,
			res.data.store.address.latitude,
			res.data.store.address.longitude
		);

		agreement = res.data;
	};

	const showCancelAgreementModal = () => {
		handleAgreementModal(CancelAgreementModal, agreement);
	};

	const showAcceptAgreementModal = () => {
		handleAgreementModal(AcceptAgreementModal, agreement);
	};

	const showRefuseAgreementModal = () => {
		handleAgreementModal(RefuseAgreementModal, agreement);
	};

	const handleAgreementModal = (Modal, obj) => {
		open(Modal, {
			agreement: obj,
			onClose: async res => {
				if (res.success) {
					await getAgreement(agreement.id);
				}
			}
		});
	};

	const isSender = agreement => {
		if (
			agreement.status == AgreementStatusKind.WaitingForProducerApproval.Value &&
			agreement.store.id == authManager.user.profile.sub
		)
			return true;

		if (
			agreement.status == AgreementStatusKind.WaitingForStoreApproval.Value &&
			agreement.producer.id == authManager.user.profile.sub
		)
			return true;

		return false;
	};

	onMount(async () => {
		await getAgreement(params.id);
	});
</script>

<svelte:head>
	<title>Détails de l'accord</title>
</svelte:head>

<TransitionWrapper>
	<ErrorCard {errorsHandler}/>
	{#if !agreement}
		<Loader/>
	{:else}
		<section class="mx-0 pb-5">
			<div class="mb-3">
				<button
					class="text-gray-600 items-center flex uppercase"
					on:click={() => routerInstance.goTo(AgreementRoutes.List)}>
					<Icon data={faChevronLeft} scale=".8" class="mr-2 inline"/>
					Accords
				</button>
			</div>
			<div class="flex flex-wrap items-center">
				<div>
					<h1 class="text-2xl lg:text-3xl mb-0">Détails de l'accord</h1>
				</div>
			</div>
		</section>
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
				<ProducerAgreement producerId={agreement.producer.id} {distanceInfos} agreementDelivery={agreement.delivery}/>
			{:else}
				<StoreAgreement storeId={agreement.store.id} {distanceInfos}/>
			{/if}
		</div>
	{/if}
</TransitionWrapper>

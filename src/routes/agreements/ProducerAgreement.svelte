<script>
	import {slide} from "svelte/transition";
	import ProducerOtherProducts from "../../components/ProducerOtherProducts.svelte";
	import Icon from "svelte-awesome";
	import {
		faChevronDown,
		faChevronUp,
		faMapMarkerAlt,
		faPhone,
		faEnvelope,
		faChevronLeft
	} from "@fortawesome/free-solid-svg-icons";
	import DayOfWeekKind from "../../enums/DayOfWeekKind";
	import {groupBy, timeSpanToFrenchHour} from "./../../helpers/app";
	import {onMount} from "svelte";
	import GetGraphQLInstance from "./../../services/SheaftGraphQL.js";
	import GetAuthInstance from "./../../services/SheaftAuth.js";
	import GetRouterInstance from "./../../services/SheaftRouter";
	import AgreementRoutes from "./routes";
	import {GET_PRODUCER_DETAILS} from "../account/queries";
	import SheaftErrors from "../../services/SheaftErrors";
	import {GET_PRODUCER_DELIVERIES} from "../search-producers/queries";
	import DeliveryKind from "../../enums/DeliveryKind";

	export let agreementDelivery, producerId, distanceInfos;

	const errorsHandler = new SheaftErrors();
	const authManager = GetAuthInstance();
	const graphQLInstance = GetGraphQLInstance();
	const routerInstance = GetRouterInstance();

	let producer = null;
	let deliveries = [];
	let deliveryHours = [];
	let producerDescriptionExpanded = false;

	const getProducer = async id => {
		var res = await graphQLInstance.query(GET_PRODUCER_DETAILS, {
			id: id
		}, errorsHandler.Uuid);

		if (!res.success) {
			//TODO
			routerInstance.goTo(AgreementRoutes.List);
			return;
		}

		if (!agreementDelivery || !agreementDelivery.deliveryHours || agreementDelivery.deliveryHours.length < 1) {
			var deliveryRes = await graphQLInstance.query(GET_PRODUCER_DELIVERIES, {
				input: {
					ids: [id],
					kinds: [DeliveryKind.ProducerToStore.Value]
				}
			});

			if (!deliveryRes.success) {
				//TODO
			} else {
				deliveries = deliveryRes.data[0].deliveries
			}
		} else {
			deliveryHours = groupBy(agreementDelivery.deliveryHours, item => [item.day]).map((g) => g.filter((delivery, index, self) =>
				index === self.findIndex((d) => (
					d.day === delivery.day && d.from === delivery.from && d.to === delivery.to
				))
			));
		}

		producer = res.data;
	};

	const getDeliveryHours = deliveryHours => {
		return groupBy(deliveryHours, item => [item.day]).map((g) => g.filter((delivery, index, self) =>
			index === self.findIndex((d) => (
				d.day === delivery.day && d.from === delivery.from && d.to === delivery.to
			))
		));
	}

	onMount(async () => {
		await getProducer(producerId);
	})
</script>

{#if producer}
	<div class="mt-5">
		<div
			id="producer-card"
			class="bg-white overflow-hidden rounded-lg p-3 lg:p-6 shadow flex
          relative flex-wrap justify-between lg:mt-10"
			style="transition: all .4s ease-in-out;">
			<img
				class="h-10 w-10 md:h-24 md:w-24 rounded-full p-1 md:mx-0 border
            border-gray-800 border-solid"
				src={producer.picture ? producer.picture : 'img/icons/farmer.svg'}
				alt="Producteur"/>
			<div class="w-7/12 md:w-6/12">
				<p class="text-base lg:text-lg">{producer.name}</p>
				<div class="text-gray-600 text-sm lg:text-base">
					{producer.address.line1}
				</div>
				{#if producer.address.line2}
					<div class="text-gray-600 text-sm lg:text-base">
						{producer.address.line2}
					</div>
				{/if}
				<div class="text-gray-600 text-sm lg:text-base">
					{producer.address.zipcode} {producer.address.city}
				</div>
				<p class="text-base mb-1 mt-3">
					<Icon
						data={faPhone}
						class="mr-1 inline"
						style="margin-bottom: 1px; width: 20px;"/>
					{#if producer.phone}
						<a href="tel:{producer.phone}">
							{producer.phone}
						</a>
					{:else}Non renseigné
					{/if}
				</p>
				<p class="text-base mb-1">
					<Icon
						data={faEnvelope}
						class="mr-1 inline"
						style="margin-bottom: 3px; width: 20px;"/>
					<a href="mailto:{producer.email}">
						{producer.email}
					</a>
				</p>
			</div>
			{#if distanceInfos}
				<div
					class="distance-badge-content text-sm lg:text-base
              w-2/12 text-center rounded-full h-10 flex justify-center
              items-center border" style="color: {distanceInfos.color}; border-color: {distanceInfos.color};">
					<Icon data={faMapMarkerAlt} scale="1.4" class="pr-1"/>
					<p class="font-bold">{distanceInfos.label}</p>
				</div>
			{/if}
			{#if producer.summary}
				<div class="w-12/12 text-gray-600 py-5">
					{producer.summary}
				</div>
			{/if}
			<div
				on:click={() => producerDescriptionExpanded = !producerDescriptionExpanded}
				class:hidden={!producer.description}
				class="rounded-b-lg w-full py-3 bg-white
            text-center font-semibold flex
            justify-center items-center cursor-pointer mt-2">
				{#if !producerDescriptionExpanded}
					<Icon data={faChevronDown} class="mr-2"/>
					<span>En savoir plus sur le producteur</span>
				{:else}
					<Icon data={faChevronUp} class="mr-2"/>
					<span>Replier le bandeau</span>
				{/if}
			</div>
			{#if producerDescriptionExpanded && producer.description}
				<div transition:slide id="producer-description" class="w-12/12 text-gray-600 py-5">
					{producer.description}
				</div>
			{/if}
			<div class="w-full">
				<ProducerOtherProducts producerName={producer.name}
															 producerId={producer.id} {errorsHandler}/>
			</div>

			{#if agreementDelivery && agreementDelivery.deliveryHours && agreementDelivery.deliveryHours.length > 0}
				<p class="mt-3 font-semibold pt-5">Horaires de livraisons</p>
				<div class="bg-gray-100 rounded-lg p-4 px-5 mt-2 w-full">
					<div class="mt-2">
						{#each agreementDelivery.deliveryHours as deliveryHour, index}
							<div class="flex mb-2 border-gray-300"
									 class:pb-2={index !== agreementDelivery.deliveryHours.length - 1}
									 class:border-b={index !== agreementDelivery.deliveryHours.length - 1}>
								<p style="min-width: 100px;">
									{DayOfWeekKind.label(deliveryHour[0].day)}
								</p>
								<div>
									{#each deliveryHour as hours}
										<p>{`${timeSpanToFrenchHour(hours.from)} à ${timeSpanToFrenchHour(hours.to)}`}</p>
									{/each}
								</div>
							</div>
						{/each}
					</div>
				</div>
			{:else if deliveries.length > 0}
				<p class="mt-3 font-semibold pt-5">Livraisons disponible</p>
				{#each deliveries as delivery, index}
					<div class="bg-gray-100 rounded-lg p-4 px-5 mt-2 w-full">
						<div class="mt-2">
							<p class="mb-2">{delivery.name}</p>
							{#if delivery.deliveryHours}
								{#each getDeliveryHours(delivery.deliveryHours) as deliveryHour, index}
									<div class="flex mb-2 border-gray-300"
											 class:pb-2={index !== delivery.deliveryHours.length - 1}
											 class:border-b={index !== delivery.deliveryHours.length - 1}>
										<p style="min-width: 100px;">
											{DayOfWeekKind.label(deliveryHour[0].day)}
										</p>
										<div>
											{#each deliveryHour as hours}
												<p>{`${timeSpanToFrenchHour(hours.from)} à ${timeSpanToFrenchHour(hours.to)}`}</p>
											{/each}
										</div>
									</div>
								{/each}
							{/if}
						</div>
					</div>
				{/each}
			{:else}
				<p class="text-gray-600 mt-4">Il semblerait que ce producteur n'ait aucune livraison panifiée.</p>
			{/if}
		</div>
	</div>
{/if}

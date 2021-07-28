<script>
	import TransitionWrapper from "../../components/TransitionWrapper.svelte";
	import ProducerTraceabilityCard from "./ProducerTraceabilityCard.svelte";
	import { GET_PRODUCERS } from "./queries";
	import SheaftErrors from "../../services/SheaftErrors";
	import PageHeader from "../../components/PageHeader.svelte";
	import { authUserAccount } from "./../../stores/auth.js";
	import PageBody from "../../components/PageBody.svelte";
	import Observations from "../../components/observations/Observations.svelte";
	import { getContext, onMount } from "svelte";

	const errorsHandler = new SheaftErrors();
	const { query } = getContext("api");

	let isLoading = true;
	let items = [];
	let selectedProducer = null;

	onMount(async () => {
		isLoading = true;
		await query({
			query: GET_PRODUCERS,
			variables: { id: $authUserAccount.id },
			errorsHandler,
			success: (res) => (items = res.producers),
			error: () => close(),
			errorNotification: "Impossible de récupérer les producteurs.",
		});
		isLoading = false;
	});
</script>

<TransitionWrapper>
	<PageHeader name="Traçabilité" />
	<PageBody {errorsHandler}>
		{#if isLoading}
			<div
				class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
				gap-3 mt-3"
			>
				{#each Array(9) as _i}
					<div>
						<div class="shadow-md h-full skeleton-box rounded-t-md">
							<div class="relative pb-5/6 overflow-hidden rounded-t-md">
								<div style="height: 150px;" class="skeleton-box w-full rounded-t-md" />
							</div>
							<div class="relative">
								<div class="bg-white p-6 rounded-b-lg">
									<div class="flex items-baseline">
										<div
											class="text-xs uppercase font-semibold tracking-wide mr-6
											w-64 skeleton-box"
										/>
									</div>
									<div class="mb-1 h-4 skeleton-box" />
									<div class="mb-1 h-4 w-48 skeleton-box" />
									<div class="mt-1 h-6 skeleton-box" />
									<div class="mt-2 w-32 uppercase h-5 skeleton-box" />
									<div class="mt-3 w-40 mb-2 uppercase h-5 skeleton-box" />
									<div class="h-12 w-48 skeleton-box" />
								</div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div
				class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
				md:gap-3 -mx-4 md:mx-0"
			>
				{#each items as producer}
					<ProducerTraceabilityCard {producer} on:click={() => (selectedProducer = producer)} />
				{/each}
			</div>
		{/if}
	</PageBody>
</TransitionWrapper>

{#if selectedProducer}
	<Observations
		on:close={() => (selectedProducer = null)}
		title="Observations - {selectedProducer.name}"
		producerId={selectedProducer.id}
	/>
{/if}

<script>
	import { onMount } from "svelte";
	import Select from "./../../components/controls/select/Select.js";
	import GetRouterInstance from "../../services/SheaftRouter.js";

	const routerInstance = GetRouterInstance();

	export let filters,
		inline = false,
		callback = () => {};

	let sort = undefined;

	onMount(() => {
		let values = routerInstance.getQueryParams();
		if (!values["sort"]) {
			sort = sortings.find((s) => s.value === "producer_geolocation asc");
		} else {
			sort = sortings.find((s) => s.value === values["sort"]);
		}
	});

	const sortings = [
		{ value: "producer_geolocation asc", label: "le plus proche d'abord" },
		{ value: "product_onSalePricePerUnit asc", label: "le moins cher d'abord" },
		{ value: "product_onSalePricePerUnit desc", label: "le plus cher d'abord" },
	];

	$: if (sort) {
		let tags = [];
		let values = routerInstance.pushQueryParams({ sort: sort.value });

		if (values["category"]) {
			values["category"] = values["category"];
			tags = [...tags, values["category"]];
		}

		if (values["labels"]) {
			values["labels"] = values["labels"].split(",");
			tags = [...tags, ...values["labels"]];
		}

		filters.set({ ...values, tags });
	}

</script>

{#if inline}
	<div class="flex flex-wrap">
		{#each sortings as sorting}
			<span
				on:click={() => {
					sort = sorting;
					callback();
				}}
				class="mx-2 mb-2 py-2 px-4 h-6 rounded-full text-sm flex items-center cursor-pointer bg-white border border-normal"
				class:font-semibold={sort && sort.value === sorting.value}
				class:border-accent={sort && sort.value === sorting.value}
				class:text-accent={sort && sort.value === sorting.value}
			>
				{sorting.label}
			</span>
		{/each}
	</div>
{:else}
	<div class="themed">
		<Select items={sortings} isClearable={false} isSearchable={false} bind:selectedValue={sort} />
	</div>
{/if}

<style>
	.themed {
		--padding: 16px;
		--cursor: pointer;
		--borderFocusColor: #a0aec0;
		--borderRadius: 50px;
		--placeholderColor: #ff4081;
		--itemIsActiveBG: #ff4081;
		--itemActiveBackground: #ff4081;
		--itemHoverBG: #e4fff7;
		--indicatorHeight: 29px;
		--indicatorTop: 7px;
	}

</style>

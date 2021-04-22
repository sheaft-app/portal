<script>
	import Paginate from "./../../enums/Paginate";
	import OrderByDirection from "./../../enums/OrderByDirection";
	import { PurchaseOrderStatus } from "../../enums/PurchaseOrderStatusKind";
	import Loader from "./../Loader.svelte";
	import Icon from "svelte-awesome";
	import { querystring } from "svelte-spa-router";
	import GetRouterInstance from "../../services/SheaftRouter.js";
	import GetGraphQLInstance from "../../services/SheaftGraphQL.js";
	import { faLongArrowAltDown } from "@fortawesome/free-solid-svg-icons";
	import InputCheckbox from "../controls/InputCheckbox.svelte";
	import { toggleMoreActions } from "../../stores/app";

	export let items,
		headers,
		isLoading,
		graphQuery,
		errorsHandler,
		noResults,
		disableRowSelection = () => false,
		defaultSearchValues = {
			cursor: null,
			orderBy: "createdOn",
			direction: OrderByDirection.DESC,
			paginate: Paginate.After,
			take: 20
		},
		selectedItems = null,
		getRowBackgroundColor = null,
		onRowClick = (item) => selectRow(item),
		classes = "";

	const routerInstance = GetRouterInstance();
	const graphQLInstance = GetGraphQLInstance();

	let _pagination = [];
	let _searchValues = null;
	let _take = null;
	let _totalCount = 0;
	let _pageInfo = {
		hasPreviousPage: false,
		hasNextPage: false,
		endCursor: null,
		startCursor: null,
	};

	const sort = (sortLabel) => {
		_searchValues.orderBy = sortLabel;
		_searchValues.paginate = Paginate.First;
		_searchValues.direction =
			_searchValues.direction == OrderByDirection.ASC
				? OrderByDirection.DESC
				: OrderByDirection.ASC;

		routerInstance.replaceQueryParams(_searchValues);
	};

	const toggleSelectAll = () => {
		if (selectedItems && selectedItems.length > 0)
			selectedItems = [];
		else
			selectedItems = items.filter((i) => !disableRowSelection(i));
	};

	const selectRow = (item) => {
		if (!selectedItems) return;

		var filteredItems = selectedItems.filter((si) => si.id != item.id);
		if (filteredItems.length != selectedItems.length)
			selectedItems = filteredItems;
		else selectedItems = [...selectedItems, item];
	};

	const getArrowClass = (headerSortLabel, status) => {
		var direction = routerInstance.getQueryParams()["direction"];
		return direction === status && headerSortLabel === _searchValues.orderBy
			? "text-gray-700"
			: "text-gray-300";
	};

	const refetch = async (querystring) => {
		var variables = createVariables();
		if (!variables) return;

		if (!errorsHandler)
			throw "Prop ErrorsHandler must be passed. Instanciate it in the parent and pass it to the Filters component.";

		isLoading = true;
		var result = await graphQLInstance.query(
			graphQuery,
			variables,
			errorsHandler.Uuid
		);
		isLoading = false;
		if (!result.success) {
			//TODO
			return;
		}

		_pageInfo = result.pageInfo;
		_pagination.push(_pageInfo);
		_totalCount = result.totalCount;

		items = result.data;
		window.scrollTo(0, 0);
	};

	const goToFirstPage = () => {
		if (!_pageInfo.hasPreviousPage) return;
		goToPage(Paginate.First, null);
	};

	const goToPreviousPage = () => {
		if (!_pageInfo.hasPreviousPage || _pagination.length < 3) {
			_pagination = [];
			goToPage(Paginate.First, null);
			return;
		}

		_pagination.pop();
		_pagination.pop();
		_pageInfo = _pagination[_pagination.length - 1];

		goToPage(Paginate.After, _pageInfo.endCursor);
	};

	const goToNextPage = () => {
		if (!_pageInfo.hasNextPage) return;
		goToPage(Paginate.After, _pageInfo.endCursor);
	};

	const goToLastPage = () => {
		if (!_pageInfo.hasNextPage) return;
		goToPage(Paginate.Last, null);
	};

	const goToPage = (paginate, cursor) => {
		_searchValues.cursor = cursor;
		_searchValues.paginate = paginate;
		routerInstance.replaceQueryParams(_searchValues);
	};

	const createVariables = () => {
		_searchValues = routerInstance.getQueryParams();

		var updateQueryParams = false;
		if (Object.keys(_searchValues).length == 0) {
			_searchValues = defaultSearchValues;
			updateQueryParams = true;
		}

		if (!_searchValues.paginate) {
			_searchValues.paginate = defaultSearchValues.paginate;
			updateQueryParams = true;
		}

		if (!_searchValues.direction) {
			_searchValues.direction = defaultSearchValues.direction;
			updateQueryParams = true;
		}

		if (!_searchValues.take) {
			_searchValues.take = defaultSearchValues.take;
			updateQueryParams = true;
		}

		if (_take && _take != _searchValues.take) {
			_pagination = [];
		}

		_take = _searchValues.take;

		if (updateQueryParams) {
			_pagination = [];
			routerInstance.replaceQueryParams(_searchValues);
			return null;
		}

		let settings = null;
		switch (_searchValues.paginate) {
			case Paginate.After:
				settings = {
					first: parseInt(_searchValues.take),
					last: null,
					after: _searchValues.cursor,
					before: null,
					orderBy: {},
					where: _searchValues.where ? {} : null
				};
				break;
			case Paginate.Before:
				settings = {
					last: parseInt(_searchValues.take),
					first: null,
					before: _searchValues.cursor,
					after: null,
					orderBy: {},
					where: _searchValues.where ? {} : null
				};
				break;
			case Paginate.Last:
				settings = {
					first: null,
					last: parseInt(_searchValues.take),
					after: null,
					before: _searchValues.cursor,
					orderBy: {},
					where: _searchValues.where ? {} : null
				};
				break;
			case Paginate.First:
			default:
				settings = {
					last: null,
					first: parseInt(_searchValues.take),
					before: null,
					after: _searchValues.cursor,
					orderBy: {},
					where: _searchValues.where ? {} : null
				};
				break;
		}

		if (_searchValues.where && _searchValues.whereValues) {
			settings.where[_searchValues.where] = _searchValues.whereValues.split(',');
		}

		settings.orderBy[_searchValues.orderBy] = _searchValues.direction;
		return settings;
	};

	$: canSelect = selectedItems && items.length > 0;
	$: hasSelectedAllItems = selectedItems && selectedItems.length >= 1 && selectedItems.length == items.filter((i) => !disableRowSelection(i)).length;
	$: isRowSelected = (item) => selectedItems && selectedItems.some((si) => si.id == item.id);
	$: rowColor = (item) => {
		if (isRowSelected(item)) return "bg-gray-100";

		if (getRowBackgroundColor) return getRowBackgroundColor(item);
		else return "";
	};
	$: noResults = !isLoading && items.length < 1 && !(_searchValues && _searchValues.where && _searchValues.where.length > 1);

	$: refetch($querystring);
</script>

{#if isLoading}
	<Loader />
{:else if !noResults}
	{#if $toggleMoreActions}
		<div class="fixed w-full h-full bg-black opacity-25 -mx-4 md:mx-0" style="z-index: 1;" on:click={() => toggleMoreActions.set(false)}></div>
	{/if}
	<div class="overflow-x-auto bg-white shadow -mx-4 md:mx-0 -my-4 lg:mx:0 lg:my-0 table-container">
		<slot name="filters"></slot>
		<slot name="globalActions"></slot>
		<table class={classes}>
			<thead>
				<tr class="bg-white">
					{#if canSelect}
						<th
							class="px-3 md:px-6 py-3 border-b border-gray-300
							text-left text-xs leading-4 font-medium text-gray-500 uppercase
							tracking-wider"
							style="width:30px;">
							<InputCheckbox
								onClick={() => toggleSelectAll()}
								checked={hasSelectedAllItems} />
						</th>
					{/if}
					{#each headers as header}
						{#if header.sortLabel}
							<th
								class:px-3={!header.noMobilePadding}
								on:click={sort(header.sortLabel)}
								class="{header.displayOn ? `hidden ${header.displayOn}:table-cell` : `table-cell`}
								md:px-6 py-3 cursor-pointer hover:text-gray-700 border-b
								border-gray-300 text-left text-xs leading-4
								font-medium text-gray-600 uppercase tracking-wider">
								{header.name}
								<Icon
									data={faLongArrowAltDown}
									class="{getArrowClass(header.sortLabel, OrderByDirection.DESC)}
									inline ml-2 transition duration-200 ease-linear" />
								<Icon
									data={faLongArrowAltDown}
									class="{getArrowClass(header.sortLabel, OrderByDirection.ASC)}
									inline transition duration-200 ease-linear transform
									rotate-180" />
							</th>
						{:else}
							<th
								class:px-3={!header.noMobilePadding}
								class="{header.displayOn ? `hidden ${header.displayOn}:table-cell` : `table-cell`}
								md:px-6 py-3 border-b border-gray-300 text-left
								text-xs leading-4 font-medium text-gray-600 uppercase
								tracking-wider">
								{header.name}
							</th>
						{/if}
					{/each}
				</tr>
			</thead>
			<tbody>
				{#if items.length > 0}
					{#each items as item}
						<tr
							on:click|stopPropagation={() => onRowClick(item)}
							class="{rowColor(item)} cursor-pointer ripple border-b
							border-gray-200">
							{#if canSelect}
								<td
									class="px-3 md:px-6 py-4 whitespace-no-wrap border-b
									border-gray-200"
									class:disabled={disableRowSelection(item)}
									on:click|stopPropagation={(e) => {
										if (!disableRowSelection(item)) {
											selectRow(item);
										}
									}}>
									<div class="flex items-center">
										<div class="flex-shrink-0">
											<InputCheckbox disabled={disableRowSelection(item)} checked={isRowSelected(item)} />
										</div>
									</div>
								</td>
							{/if}
							<slot rowItem={item} />
						</tr>
					{/each}
				{:else}
					<tr>
						<td colspan={canSelect ? headers.length + 1 : headers.length} class="text-center px-3 md:px-6 py-4 whitespace-no-wrap border-b
						border-gray-200 hover:bg-white">
							Aucun résultat à afficher
						</td>
					</tr>
				{/if}
			</tbody>
		</table>
		{#if _pageInfo.hasPreviousPage || _pageInfo.hasNextPage}
			<div class="px-4 py-3 flex items-center justify-between sm:px-6">
				<div class="flex-1 flex justify-center">
					<!-- {#if _pageInfo && _pageInfo.hasPreviousPage}
        <button
          on:click={() => goToFirstPage()}
          class:disabled={!_pageInfo.hasPreviousPage}
          disabled={!_pageInfo.hasPreviousPage}
          class="relative inline-flex items-center px-4 py-2 border border-gray-400
          text-sm leading-5 font-medium rounded-md text-gray-700 bg-white
          hover:text-gray-500 focus:outline-none focus:shadow-outline-blue
          focus:border-blue-300 active:bg-gray-100 active:text-gray-700 transition
          ease-in-out duration-150">
          Revenir au début
        </button>
        {/if} -->
					<button
						on:click={() => goToPreviousPage()}
						class:disabled={!_pageInfo.hasPreviousPage}
						disabled={!_pageInfo.hasPreviousPage}
						class="ml-3 relative inline-flex items-center px-4 py-2 border
						border-gray-400 text-sm leading-5 font-medium rounded-md
						text-gray-700 bg-white hover:text-gray-500 focus:outline-none
						focus:shadow-outline-blue focus:border-blue-300 active:bg-gray-100
						active:text-gray-700 transition ease-in-out duration-150">
						Précédent
					</button>
					<button
						on:click={() => goToNextPage()}
						class:disabled={!_pageInfo.hasNextPage}
						disabled={!_pageInfo.hasNextPage}
						class="ml-3 relative inline-flex items-center px-4 py-2 border
						border-gray-400 text-sm leading-5 font-medium rounded-md
						text-gray-700 bg-white hover:text-gray-500 focus:outline-none
						focus:shadow-outline-blue focus:border-blue-300 active:bg-gray-100
						active:text-gray-700 transition ease-in-out duration-150">
						Suivant
					</button>
					<!-- <button
          on:click={() => goToLastPage()}
          class:disabled={!_pageInfo.hasNextPage}
          disabled={!_pageInfo.hasNextPage}
          class="ml-3 relative inline-flex items-center px-4 py-2 border
          border-gray-400 text-sm leading-5 font-medium rounded-md text-gray-700
          bg-white hover:text-gray-500 focus:outline-none focus:shadow-outline-blue
          focus:border-blue-300 active:bg-gray-100 active:text-gray-700 transition
          ease-in-out duration-150">
          Fin
        </button> -->
				</div>
			</div>
		{/if}
	</div>
{/if}

<style lang="scss">
	.table-container {
		@media (max-width: 767px) {
			padding-bottom: 120px;
		}

		@media (min-width: 768px) and (max-width: 1024px) {
			margin-top: 86px;
		}

		@media (min-width: 1025px) {
			margin-top: 71px;
		}
	}

	td {
		&.disabled {
			cursor: not-allowed;
		}
	}

	button {
		&.active {
			color: #ff4081;
			@apply bg-white;
		}
	}

	div.checkbox {
		border: 1px solid #dedede;
		border-radius: 5px;
		width: 25px;
		height: 25px;

		input[type="checkbox"] {
			width: 100%;
			height: 100%;
		}
	}

	table {
		width: 100%;

		tbody tr {
			&:hover {
				@apply bg-gray-100;
			}
		}

		&.loading {
			/* hack: je comprends pas pourquoi les th se décalent par rapport aux td avec un display: table. */
			/* en attendant on ne les affiche plus pendant le loading. c'est pas très beau mais moins choquant que les th qui se décalent */
			thead {
				visibility: hidden;
				display: table;
			}

			tbody {
				display: table;
				position: relative;

				&:after {
					position: absolute;
					top: 0;
					left: 0;
					right: 0;
					bottom: 0;
					background-color: #ffffffe7;
					text-align: center;
					transform: translateY("5O%");
					background-position: center;
					background-repeat: no-repeat;
					background-size: 50px 50px;
					content: "";
				}
			}
		}
	}
</style>

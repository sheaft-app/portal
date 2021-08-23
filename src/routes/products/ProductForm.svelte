<script>
	import { onMount, onDestroy, getContext } from "svelte";
	import { fly } from "svelte/transition";
	import ProductRoutes from "./routes";
	import Icon from "svelte-awesome";
	import { faPaperPlane, faCircleNotch, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
	import CategorySelect from "./../../components/controls/CategorySelect.svelte";
	import Toggle from "./../../components/controls/Toggle.svelte";
	import Select from "./../../components/controls/select/Select.js";
	import ErrorContainer from "./../../components/ErrorContainer.svelte";
	import ReturnableSelectItem from "./ReturnableSelectItem.svelte";
	import CreateReturnable from "./../returnables/CreateReturnable.svelte";
	import TagKind from "./../../enums/TagKind.js";
	import { GET_RETURNABLES, GET_TAGS } from "./queries.js";
	import UnitKind from "../../enums/UnitKind";
	import ConditioningKind from "../../enums/ConditioningKind";
	import { config } from "../../configs/config";
	import ProductCatalogs from "./ProductCatalogs.svelte";
	import { bindClass } from "../../../vendors/svelte-forms/src/index";
	import form from "../../stores/form";
	import { validators, initialValues } from "./productForm";
	import RatingStars from "../../components/rating/RatingStars.svelte";
	import GalleryConfigurator from "../../components/GalleryConfigurator.svelte";
	import GetRouterInstance from "../../services/SheaftRouter";

	export let submit,
		product = { ...initialValues },
		errorsHandler;

	const routerInstance = GetRouterInstance();
	const { open } = getContext("modal");
	const { query, isLoading } = getContext("api");

	let selectedCategory = null;
	let returnables = [];
	let organicTag;

	$: isBasketType = selectedCategory && selectedCategory.name == "Panier garni";
	$: isBio = organicTag && product.tags.find((i) => i.kind == organicTag.kind && i.value == organicTag.value);
	$: selectedCategory =
		product.tags.length > 0 && product.tags.find((i) => i && TagKind.get(i.kind).Value == TagKind.Category.Value);
	$: quantityPerUnitLabel = isBasketType
		? "Nombre de personnes (adultes) *"
		: product.conditioning == ConditioningKind.Bulk.Value
		? "Poids *"
		: "Quantité *";

	(() => (product = form.initialize(product, validators, initialValues)))();

	onMount(async () => {
		returnables = await query({
			query: GET_RETURNABLES,
			errorsHandler,
			error: () => routerInstance.goTo(ProductRoutes.List),
			errorNotification: "Un problème est survenu pendant la récupération des informations du produit.",
		});

		await query({
			query: GET_TAGS,
			errorsHandler,
			success: (res) =>
				(organicTag = res.find(
					(t) => t.name.toLowerCase() === "bio" && TagKind.Label.Value == TagKind.get(t.kind).Value
				)),
			error: () => routerInstance.goTo(ProductRoutes.List),
			errorNotification: "Un problème est survenu pendant la récupération des informations du produit.",
		});
	});

	onDestroy(async () => {
		await form.destroy();
	});

	const handleSubmit = async () => {
		if (product.conditioning != ConditioningKind.Bulk.Value) {
			product.unit = UnitKind.NotSpecified.Value;
		}

		if (
			product.conditioning == ConditioningKind.Bouquet.Value ||
			product.conditioning == ConditioningKind.Bunch.Value
		) {
			product.quantityPerUnit = 1;
		}

		return form.validateAndSubmit(submit);
	};

	const toggleBio = () => {
		if (!isBio) {
			product.tags = [...product.tags, organicTag];
		} else {
			product.tags = product.tags.filter((i) => i.id !== organicTag.id);
		}
	};

	const changeCategory = (category) => {
		if (category.detail.name == "Panier garni") {
			product.conditioning = ConditioningKind.Basket.Value;
		} else if (isBasketType) {
			// la catégorie précédente était panier garni, reset le conditionnement
			product.conditioning = ConditioningKind.Bulk.Value;
		}

		if (product.tags) {
			product.tags = [
				...product.tags.filter((i) => TagKind.get(i.kind).Value != TagKind.Category.Value),
				category.detail,
			];
		} else {
			product.tags = [category.detail];
		}
	};

	const selectVat = (vat) => (product.vat = vat);

	const showCreateReturnableModal = () => {
		open(CreateReturnable, {
			isInModal: true,
			onClose: async (res) => {
				returnables = [...returnables, res];
				product.returnable = res;
			},
		});
	};
</script>

<!-- svelte-ignore component-name-lowercase -->
<form class="w-full" on:submit|preventDefault={handleSubmit}>
	<div class="flex flex-wrap mb-6 lg:mb-0">
		<div class="w-full lg:w-1/2">
			<div class="form-control">
				<div class="w-full">
					<label for="grid-reference">Référence</label>
					<input
						bind:value={product.reference}
						class:skeleton-box={$isLoading}
						disabled={$isLoading}
						id="grid-reference"
						type="text"
						placeholder="Auto-générée si non renseignée"
					/>
				</div>
			</div>
			<div class="form-control">
				<div class="w-full">
					<label for="grid-product">Nom du produit *</label>
					<input
						bind:value={product.name}
						use:bindClass={{ form, name: "name" }}
						class:skeleton-box={$isLoading}
						disabled={$isLoading}
						name="name"
						id="grid-product"
						type="text"
						placeholder="ex : Tomate ancienne"
					/>
					<ErrorContainer field={$form.fields.name} />
				</div>
			</div>
			{#if !product.producer.notSubjectToVat}
				<div class="form-control">
					<div class="flex w-full">
						<div class="w-full">
							<label>TVA *</label>
							<div
								class="w-full text-lg justify-center button-group"
								class:skeleton-box={$isLoading}
								use:bindClass={{ form, name: "vat" }}
							>
								<button
									on:click={() => selectVat(5.5)}
									type="button"
									class="text-sm md:text-base"
									class:selected={product.vat === 5.5}
									class:skeleton-box={$isLoading}
								>
									5,5%
								</button>
								<button
									on:click={() => selectVat(10)}
									type="button"
									class="text-sm md:text-base"
									class:selected={product.vat === 10}
									class:skeleton-box={$isLoading}
								>
									10%
								</button>
								<button
									on:click={() => selectVat(20)}
									type="button"
									class="text-sm md:text-base"
									class:selected={product.vat === 20}
									class:skeleton-box={$isLoading}
								>
									20%
								</button>
							</div>
							<ErrorContainer field={$form.fields.vat} />
						</div>
					</div>
				</div>
			{/if}
			<div class="form-control" style="display: block;">
				<label>Labels</label>
				<Toggle
					labelPosition="left"
					disabled={$isLoading}
					classNames="ml-1"
					isChecked={isBio}
					onChange={() => toggleBio()}
				>
					<img src={config.content + "/pictures/tags/icons/bio.png"} alt="Produit bio" class="w-8" />
				</Toggle>
			</div>
		</div>
		<div class="w-full lg:w-1/2 lg:pl-3">
			<div class="form-control" style="display:block;">
				<div class="w-full">
					<label
						>Galerie d'images
						<Icon data={faInfoCircle} />
					</label>
					<div class="text-xxs mb-3">
						L'image en première position sera celle affichée par défaut, vous pouvez changer l'ordre des
						images en restant cliqué sur l'image et en la faisant glisser à la position voulue.
					</div>
					<GalleryConfigurator
						bind:elements={product.pictures}
						elementHeight="80"
						elementWidth="195"
						newElementMinHeight="256"
						newElementMinWidth="620"
						newElementMaxHeight="256"
						newElementMaxWidth="620"
					/>
				</div>
			</div>
		</div>
	</div>
	<div class="form-control" style="display: block;">
		<label>Présent dans les catalogues</label>
		{#if !product.id}
			<div class="rounded bg-blue-100 w-full p-4 mb-2">
				<p class="pb-2">
					Pour que vos clients puissent commander ce produit, vous devez l'ajouter à un catalogue et lui
					assigner un prix de vente HT.
				</p>
				<p class="pb-2">
					Les catalogues vous permettent de proposer ce produit à une clientèle spécifique (par exemple, vous
					pouvez vendre des seaux de yaourt aux professionels mais pas aux consommateurs.)
				</p>
				<p>
					Vous pouvez également proposer ce produit à un prix différent dans un catalogue en particulier (par
					exemple, si vos yaourts en pot sont moins chers pour les professionels car vous les vendez en volume.)
				</p>
			</div>
		{/if}
		<ProductCatalogs bind:catalogs={product.catalogs} {form} />
	</div>
	<div class="form-control" style="display: block;">
		<label>Catégorie *</label>
		<CategorySelect
			disabled={$isLoading}
			on:change={(c) => changeCategory(c)}
			bindClassData={{ form, name: "selectedCategory" }}
			{errorsHandler}
			{selectedCategory}
			displayOptionAllProducts={false}
			grid="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-4 xl:grid-cols-7 gap-3"
		/>
		<ErrorContainer field={$form.fields.selectedCategory} />
	</div>
	{#if !isBasketType}
		<div class="form-control">
			<div class="w-full">
				<label for="grid-conditioning">Conditionnement *</label>
				<div class="flex w-full">
					<div>
						<select
							bind:value={product.conditioning}
							id="grid-conditioning"
							use:bindClass={{ form, name: "conditioning" }}
							class:skeleton-box={$isLoading}
							disabled={$isLoading}
						>
							<option selected="true" value={ConditioningKind.Bulk.Value}>
								{ConditioningKind.Bulk.Label}
							</option>
							<option value={ConditioningKind.Bunch.Value}>
								{ConditioningKind.Bunch.Label}
							</option>
							<option value={ConditioningKind.Box.Value}>
								{ConditioningKind.Box.Label}
							</option>
							<option value={ConditioningKind.Bouquet.Value}>
								{ConditioningKind.Bouquet.Label}
							</option>
							<option value={ConditioningKind.Piece.Value}>
								{ConditioningKind.Piece.Label}
							</option>
						</select>
						<ErrorContainer field={$form.fields.conditioning} />
					</div>
				</div>
			</div>
		</div>
	{/if}
	{#if product.conditioning !== ConditioningKind.Bunch.Value && product.conditioning !== ConditioningKind.Bouquet.Value}
		<div class="form-control">
			<div class="w-full">
				<label for="grid-quantityPerUnit">{quantityPerUnitLabel}</label>
				<div class="flex w-full">
					<div class="mr-2">
						<input
							type="number"
							step="0.10"
							bind:value={product.quantityPerUnit}
							use:bindClass={{ form, name: "quantityPerUnit" }}
							id="grid-quantityPerUnit"
							placeholder="ex : 5"
							class:skeleton-box={$isLoading}
							disabled={$isLoading}
						/>
						<ErrorContainer field={$form.fields.quantityPerUnit} />
					</div>
					{#if product.conditioning == ConditioningKind.Bulk.Value && !isBasketType}
						<div>
							<select
								bind:value={product.unit}
								id="grid-unit"
								use:bindClass={{ form, name: "unit" }}
								class:skeleton-box={$isLoading}
								disabled={$isLoading}
							>
								<option selected="true" value={UnitKind.NotSpecified.Value} disabled
									>unité de mesure</option
								>
								<option value={UnitKind.ML.Value}>{UnitKind.ML.Label}</option>
								<option value={UnitKind.L.Value}>{UnitKind.L.Value}</option>
								<option value={UnitKind.G.Value}>{UnitKind.G.Value}</option>
								<option value={UnitKind.KG.Value}>{UnitKind.KG.Value}</option>
							</select>
							<ErrorContainer field={$form.fields.unit} />
						</div>
					{/if}
				</div>
			</div>
		</div>
	{/if}
	<div class="form-control" style="display: block;">
		<label>Type de consigne</label>
		<div class="themed">
			<Select
				items={returnables}
				getOptionLabel={(l) => l.name}
				Item={ReturnableSelectItem}
				getSelectionLabel={(l) => l.name}
				isDisabled={$isLoading}
				showChevron={true}
				hideSelectedOnFocus={true}
				optionIdentifier="id"
				placeholder="Assignez une consigne"
				noOptionsMessage="Aucune consigne trouvée"
				bind:selectedValue={product.returnable}
				isSearchable={true}
				isClearable={false}
				containerStyles="font-weight: 600; color: #4a5568;"
			/>
		</div>
		{#if returnables.length > 0 && product.returnable}
			<button
				transition:fly|local={{ y: -30 }}
				type="button"
				class="btn-link text-sm"
				on:click={() => (product.returnable = null)}
			>
				Retirer la consigne du produit
			</button>
		{:else}
			<button
				on:click={showCreateReturnableModal}
				transition:fly|local={{ y: -30 }}
				type="button"
				class="btn-link text-sm"
			>
				Créer une nouvelle consigne
			</button>
		{/if}
	</div>
	<div class="form-control">
		<div class="w-full md:w-2/2">
			<label for="grid-description">Description</label>
			<textarea
				bind:value={product.description}
				id="grid-description"
				class:disabled={$isLoading}
				disabled={$isLoading}
				type="text"
				style="min-height:150px;"
				placeholder="Tomate ancienne d'une variété très particulière"
			/>
		</div>
	</div>
	<div class="form-control" style="display: block;">
		<label>Disponible à la vente</label>
		<Toggle labelPosition="left" disabled={$isLoading} classNames="ml-1" bind:isChecked={product.available} />
	</div>
	{#if product.ratingsCount > 0}
		<div class="form-control" style="display: block;">
			<label>Evaluations client</label>
			<RatingStars rating={product.rating} />
			{#if product.ratingsCount > 0}
				<a
					href="javascript:void(0)"
					on:click={() => routerInstance.goTo(ProductRoutes.Ratings, { id: product.id })}
				>
					Voir les {product.ratingsCount} avis
				</a>
			{/if}
		</div>
	{/if}
	<p class="text-sm mt-5">* champs requis</p>
	<div class="form-control mt-5">
		<button
			type="submit"
			disabled={$isLoading}
			class:disabled={$isLoading || !$form.valid}
			class="btn btn-primary btn-xl justify-center w-full md:w-auto"
		>
			<Icon data={$isLoading ? faCircleNotch : faPaperPlane} class="mr-2 inline" spin={$isLoading} />
			Valider
		</button>
	</div>
</form>

<style lang="scss">
	.themed {
		display: contents;
		--cursor: text;
		--padding: 16px 18px;
		--borderFocusColor: #a0aec0;
		--borderHoverColor: #a0aec0;
		--border: 1px solid #cbd5e0;
		--placeholderColor: #8290a2;
		--inputPadding: 18px;
		--inputColor: #205164;
	}
</style>

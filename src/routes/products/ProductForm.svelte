<script>
	import { onMount, getContext } from "svelte";
	import { fly, slide } from "svelte/transition";
	import Icon from "svelte-awesome";
	import {
		faPaperPlane,
		faCircleNotch,
		faImage,
	} from "@fortawesome/free-solid-svg-icons";
	import CategorySelect from "./../../components/controls/CategorySelect.svelte";
	import Toggle from "./../../components/controls/Toggle.svelte";
	import Select from "./../../components/controls/select/Select.js";
	import ErrorContainer from "./../../components/ErrorContainer.svelte";
	import GetGraphQLInstance from "./../../services/SheaftGraphQL.js";
	import ReturnableSelectItem from "./ReturnableSelectItem.svelte";
	import CreateReturnable from "./../returnables/CreateReturnable.svelte";
	import TagKind from "./../../enums/TagKind.js";
	import { GET_RETURNABLES, GET_TAGS, GET_PRODUCER_DETAILS } from "./queries.js";
	import ChangeImage from "./ChangeImage.svelte";
	import { form, bindClass } from "../../../vendors/svelte-forms/src/index";
	import UnitKind from "../../enums/UnitKind";
	import ConditioningKind from "../../enums/ConditioningKind";
  import GetAuthInstance from "../../services/SheaftAuth";
import { config } from "../../configs/config";

	export let submit, product, isLoading;

	const { open } = getContext("modal");
	const graphQLInstance = GetGraphQLInstance();
	const authInstance = GetAuthInstance();

	let isLoadingTags = false;
	let isLoadingReturnables = false;
	let notSubjectToVat = false;

	let selectedCategory = null;
	let returnables = [];
	let tags = [];

	const productForm = form(
		() => ({
			name: {
				value: product.name,
				validators: ["required", "min:3"],
				enabled: true,
			},
			wholeSalePricePerUnit: {
				value: product.wholeSalePricePerUnit,
				validators: ["required", "min:0.01"],
				enabled: true,
			},
			vat: { value: product.vat, validators: ["required"], enabled: !notSubjectToVat },
			unit: { value: product.unit, validators: ["required"], enabled: product.conditioning == ConditioningKind.Bulk.Value},
			conditioning: {
				value: product.conditioning,
				validators: ["required"],
				enabled: true
			},
			quantityPerUnit: {
				value: product.quantityPerUnit,
				validators: ["required", "min:0.01"],
				enabled: product.conditioning !== ConditioningKind.Bunch.Value && product.conditioning !== ConditioningKind.Bouquet.Value,
			},
			selectedCategory: {
				value: selectedCategory,
				validators: ["required"],
				enabled: true,
			},
		}),
		{
			initCheck: false,
		}
	);

	$: isBasketType = selectedCategory && selectedCategory.name == "Panier garni";

	const handleSubmit = async () => {
    productForm.validate();

    if ($productForm.valid && !isLoading) {
      if (product.conditioning != ConditioningKind.Bulk.Value) {
		  	product.unit = UnitKind.NotSpecified.Value;
			}
		
			if (isBasketType) {
				console.log("passed");
				product.conditioning = ConditioningKind.Basket.Value
			}

			if (product.conditioning == ConditioningKind.Bouquet.Value || product.conditioning == ConditioningKind.Bunch.Value) {
				product.quantityPerUnit = 1;
			}

			return submit();
		}
	};

	let isBio = false;
	let bioTag = null;

	$: if (product && product.tags && product.tags && product.tags.length > 0) {
		selectedCategory = product.tags.find(
			(i) => TagKind.get(i.kind).Value == TagKind.Category.Value
		);
		isBio = bioTag && product.tags.filter((i) => i.id === bioTag.id).length > 0;
	}

	const toggleBio = () => {
		if (!isBio) {
			product.tags = [...product.tags, bioTag];
		} else {
			product.tags = product.tags.filter((i) => i.id !== bioTag.id);
		}
	};

	const changeCategory = (category) => {
		if (product.tags && product.tags) {
			product.tags = [
				...product.tags.filter(
					(i) => TagKind.get(i.kind).Value != TagKind.Category.Value
				),
				category.detail,
			];
		} else {
			product.tags = [category.detail];
		}
	};

	const selectVat = (vat) => {
		return (product.vat = vat);
	};

	onMount(async () => {
		isLoading = true;
		await getProducer();
		await getTags();
		await getReturnables();
		isLoading = false;
	});

	const getProducer = async () => {
		var res = await graphQLInstance.query(GET_PRODUCER_DETAILS, {
			id: authInstance.user.profile.sub
		});

		if (!res.success) {
			//TODO
			return;
		}

		notSubjectToVat = res.data.notSubjectToVat;
	}

	const getReturnables = async () => {
		isLoadingReturnables = true;
		var res = await graphQLInstance.query(GET_RETURNABLES);
		isLoadingReturnables = false;

		if (!res.success) {
			//TODO
			return;
		}

		returnables = res.data;
	};

	const getTags = async () => {
		isLoadingTags = true;
		var res = await graphQLInstance.query(GET_TAGS);
		isLoadingTags = false;

		if (!res.success) {
			//TODO
			return;
		}

		tags = res.data;
		bioTag = tags.find(
			(t) =>
				t.name.toLowerCase() === "bio" &&
				TagKind.Label.Value == TagKind.get(t.kind).Value
		);
	};

	const showCreateReturnableModal = () => {
		open(CreateReturnable, {
			isInModal: true,
			onClose: async (res) => {
				if (res.success) {
					returnables = [...returnables, res.data];
					product.returnable = res.data;
				}
			},
		});
	};

	const changeImage = () => {
		open(ChangeImage, {
			product,
			onClose: (res) => {
				if (res.success) {
					product.picture = res.data;
				}
			},
		});
	};

	$: getQuantityPerUnitLabel = () => {
		if (isBasketType) {
			return "Nombre de personnes (adultes)*";
		} 	
		
		return product.conditioning == ConditioningKind.Bulk.Value ? "Poids *" : "Quantité *";
	}
</script>

<form class="w-full" on:submit|preventDefault={handleSubmit}>
	<div class="flex flex-wrap mb-6 lg:mb-0">
		<div class="w-full lg:w-1/2">
			<div class="form-control">
				<div class="w-full">
					<label for="grid-reference">Référence</label>
					<input
						bind:value={product.reference}
						class:skeleton-box={isLoading}
						disabled={isLoading}
						id="grid-reference"
						type="text"
						placeholder="Auto-générée si non renseignée" />
				</div>
			</div>
			<div class="form-control">
				<div class="w-full">
					<label for="grid-product">Nom du produit *</label>
					<input
						bind:value={product.name}
						use:bindClass={{ form: productForm, name: 'name' }}
						class:skeleton-box={isLoading}
						disabled={isLoading}
						name="name"
						id="grid-product"
						type="text"
						placeholder="ex : Tomate ancienne" />
					<ErrorContainer field={$productForm.fields.name} />
				</div>
			</div>
			<div class="form-control">
				<div class="flex w-full">
					<div class="w-full" class:pr-2={!notSubjectToVat}>
						<label for="grid-price">{notSubjectToVat ? 'Prix *' : 'Prix HT *'}</label>
						<input
							bind:value={product.wholeSalePricePerUnit}
							use:bindClass={{ form: productForm, name: 'wholeSalePricePerUnit' }}
							class:skeleton-box={isLoading}
							disabled={isLoading}
							id="grid-price"
							type="number"
							step=".01"
							name="wholeSalePricePerUnit"
							placeholder="ex : 2.49" />
						<ErrorContainer field={$productForm.fields.wholeSalePricePerUnit} />
					</div>
					<div class="w-full" class:hidden={notSubjectToVat}>
						<label for="grid-vat">TVA *</label>
						<div
							class="w-full text-lg justify-center button-group"
							class:skeleton-box={isLoading}
							use:bindClass={{ form: productForm, name: 'vat' }}>
							<button
								on:click={() => selectVat(0)}
								type="button"
								class="text-sm md:text-base"
								class:selected={product.vat === 0}
								class:skeleton-box={isLoading}>
								0%
							</button>
							<button
								on:click={() => selectVat(5.5)}
								type="button"
								class="text-sm md:text-base"
								class:selected={product.vat === 5.5}
								class:skeleton-box={isLoading}>
								5,5%
							</button>
							<button
								on:click={() => selectVat(10)}
								type="button"
								class="text-sm md:text-base"
								class:selected={product.vat === 10}
								class:skeleton-box={isLoading}>
								10%
							</button>
							<button
								on:click={() => selectVat(20)}
								type="button"
								class="text-sm md:text-base"
								class:selected={product.vat === 20}
								class:skeleton-box={isLoading}>
								20%
							</button>
						</div>
						<ErrorContainer field={$productForm.fields.vat} />
					</div>
				</div>
			</div>
			<div class="form-control" style="display: block;">
				<label>Labels</label>
				<Toggle
					labelPosition="left"
					disabled={isLoading}
					classNames="ml-1"
					isChecked={isBio}
					onChange={() => toggleBio()}>
					<img src="{config.content + '/pictures/tags/icons/bio.png'}" alt="Produit bio" class="w-8" />
				</Toggle>
			</div>
		</div>
		<div class="w-full lg:w-1/2 lg:pl-3">
			<div class="form-control" style="height: 300px;">
				<div class="w-full" on:click={() => changeImage()}>
					<label for="grid-image">Image</label>
					<div class="border border-gray-400 cursor-pointer text-center h-full">
						{#if product.picture}
							<div
								class="h-full product-picture relative"
								style="background: url('{product.picture}'); margin:auto;">
								  {#if product.picture.includes("pictures/tags/images/")}
										<div class="absolute" style="bottom: 0%; z-index: 1;">
											<div class="text-white text-lg p-1 bg-gray-800">
												Une image par défaut est utilisée. Cliquez dans le cadre pour remplacer la photo.
											</div>
										</div>
									{/if}
								</div>
						{:else}
							<Icon
								data={faImage}
								class="mr-2 inline"
								scale={2}
								style="margin:105px;" />
								<p class="text-gray-600">Cliquez dans la zone pour ajouter une image</p>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>
	<div class="form-control" style="display: block;">
		<label>Catégorie *</label>
		<CategorySelect
			disabled={isLoading}
			on:change={(c) => changeCategory(c)}
			bindClassData={{ form: productForm, name: 'selectedCategory' }}
			{selectedCategory}
			displayOptionAllProducts={false}
			grid="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-4 xl:grid-cols-7 gap-3" />
		<ErrorContainer field={$productForm.fields.selectedCategory} />
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
							use:bindClass={{ form: productForm, name: 'conditioning' }}
							class:skeleton-box={isLoading}
							disabled={isLoading}>
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
						<ErrorContainer field={$productForm.fields.conditioning} />
					</div>
				</div>
			</div>
		</div>
	{/if}
	{#if product.conditioning !== ConditioningKind.Bunch.Value && product.conditioning !== ConditioningKind.Bouquet.Value}
		<div class="form-control">
			<div class="w-full">
				<label for="grid-quantityPerUnit">{getQuantityPerUnitLabel()}</label>
				<div class="flex w-full">
					<div class="mr-2">
						<input
							type="number"
							step="0.10"
							bind:value={product.quantityPerUnit}
							use:bindClass={{ form: productForm, name: 'quantityPerUnit' }}
							id="grid-quantityPerUnit"
							placeholder="ex : 5"
							class:skeleton-box={isLoading}
							disabled={isLoading} />
						<ErrorContainer field={$productForm.fields.quantityPerUnit} />
					</div>
					{#if product.conditioning == ConditioningKind.Bulk.Value && !isBasketType}
						<div>
							<select
								bind:value={product.unit}
								id="grid-unit"
								use:bindClass={{ form: productForm, name: 'unit' }}
								class:skeleton-box={isLoading}
								disabled={isLoading}>
								<option selected="true" value={UnitKind.NotSpecified.Value} disabled>unité de mesure</option>
								<option value={UnitKind.ML.Value}>{UnitKind.ML.Label}</option>
								<option value={UnitKind.L.Value}>{UnitKind.L.Value}</option>
								<option value={UnitKind.G.Value}>{UnitKind.G.Value}</option>
								<option value={UnitKind.KG.Value}>{UnitKind.KG.Value}</option>
							</select>
							<ErrorContainer field={$productForm.fields.unit} />
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
				isDisabled={isLoading}
				showChevron={true}
				hideSelectedOnFocus={true}
				optionIdentifier="id"
				placeholder="Assignez une consigne"
				noOptionsMessage="Aucune consigne trouvée"
				bind:selectedValue={product.returnable}
				isSearchable={true}
				isClearable={false}
				containerStyles="font-weight: 600; color: #4a5568;" />
		</div>
		{#if returnables.length > 0 && product.returnable}
			<button
				transition:fly|local={{ y: -30 }}
				type="button"
				class="btn-link text-sm"
				on:click={() => (product.returnable = null)}>
				Retirer la consigne du produit
			</button>
		{:else}
			<button
				on:click={showCreateReturnableModal}
				transition:fly|local={{ y: -30 }}
				type="button"
				class="btn-link text-sm">
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
				class:disabled={isLoading}
				disabled={isLoading}
				type="text"
				style="min-height:150px;"
				placeholder="Tomate ancienne d'une variété très particulière" />
		</div>
	</div>
	<div class="form-control" style="display: block;">
		<label>Disponible à la vente</label>
		<Toggle
			labelPosition="left"
			disabled={isLoading}
			classNames="ml-1"
			bind:isChecked={product.available}>
		</Toggle>
	</div>
	<div class="form-control" style="display: block;">
		<label>Visible pour les consommateurs</label>
		<Toggle
			labelPosition="left"
			disabled={isLoading}
			classNames="ml-1"
			bind:isChecked={product.visibleToConsumers}>
		</Toggle>
	</div>
	<div class="form-control" style="display: block;">
		<label>Visible pour les magasins</label>
		<Toggle
			labelPosition="left"
			disabled={isLoading}
			classNames="ml-1"
			bind:isChecked={product.visibleToStores}>
		</Toggle>
	</div>
	<p class="text-sm mt-5">* champs requis</p>
	<div class="form-control mt-5">
		<button
			type="submit"
			class:disabled={isLoading || !$productForm.valid}
			class="btn btn-primary btn-xl justify-center w-full md:w-auto">
			<Icon
				data={isLoading ? faCircleNotch : faPaperPlane}
				class="mr-2 inline"
				spin={isLoading} />
			Valider
		</button>
	</div>
</form>

<style>
	.product-picture {
		background-size: cover !important;
		background-position: center !important;
		background-repeat: no-repeat !important;
	}
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

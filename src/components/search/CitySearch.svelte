<script>
	import { onMount } from "svelte";
	import Select from "./../controls/select/Select.js";
	import Icon from "svelte-awesome";
	import CityService from "./../../services/CityService.js";
	import CityItem from "./CityItem.svelte";
	import TopItem from "./TopItem.svelte";
	import { faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
	import Guid from "./../../helpers/Guid";
	import { bindClass } from "../../../vendors/svelte-forms/src/index";

	const cityService = new CityService();

	export let IconComponent = null,
		withGeolocationButton = false,
		containerStyles = "",
		initAddress = null,
		selectedAddress = null,
		invalid = false,
		bindClassData = null,
		isDisabled = false,
		placeholder = null;

	let isLoading = false;

	const setLocationByAddress = async (query) => {
		isLoading = true;
		const res = await cityService.SearchByAddress(query);
		isLoading = false;

		if (!res.success) {
			//TODO
			return;
		}

		if(res.data && res.data.length > 0){
			selectedAddress = res.data[0];
		}
	};

	const setLocation = async (position) => {
		isLoading = true;
		var res = await cityService.SearchByPosition(position);
		isLoading = false;
		if (!res.success) {
			//TODO
			return;
		}

		selectedAddress = res.data;
	};

	const handleUserLocation = async () => {
		if (!navigator.geolocation) {
			//TODO
			return;
		}

		isLoading = true;
		return navigator.geolocation.getCurrentPosition(
			async (position) => {
				var pos = {
					latitude: position.coords.latitude,
					longitude: position.coords.longitude,
				};

				await setLocation(pos);
				isLoading = false;
			},
			(err) => {
				isLoading = false;
			}
		);
	};

	const handleSelect = (selectedItem) => {
		delete selectedItem.detail["id"];
		selectedAddress = selectedItem.detail;
	};

	const loadData = async (filterText) => {
		var res = await cityService.SearchByAddress(filterText);
		if (!res.success) {
			//TODO
			return [];
		}

		return res.data.map((d) => {
			return {
				...d,
				id: Guid.NewGuid(),
			};
		});
	};

	const getOptionLabel = (option) => option.line1;
	const getSelectionLabel = (option) => {
		if (!option || !option.line1 || !option.city || !option.zipcode) return "";

		return `<p class="leading-none mt-1 uppercase">${option.line1}</p><p class="leading-none text-xs mt-1 uppercase">${option.zipcode} ${option.city}</p>`;
	};

	const initDefaultAddress = async (address) => {
		if (!address) return;

		if (address.line1 && address.zipcode && address.city && (!address.latitude || !address.longitude)) {
			const query = `${address.line1} ${address.zipcode} ${address.city}`;
			await setLocationByAddress(query);
			return;
		}

		if (address.latitude && address.longitude && (!address.line1 || !address.zipcode || !address.city)) {
			await setLocation({
				latitude: address.latitude,
				longitude: address.longitude,
			});
			return;
		}
	};

	$: initDefaultAddress(initAddress);
</script>

<div class="themed" use:bindClass={bindClassData}>
	<Select
		loadOptions={(text) => loadData(text)}
		{getOptionLabel}
		isDisabled={isLoading || isDisabled}
		isWaiting={isLoading}
		{invalid}
		icon={faMapMarkerAlt}
		iconClasses="mr-3 text-accent"
		{getSelectionLabel}
		on:select={handleSelect}
		isClearable={false}
		showChevron={true}
		hideSelectedOnFocus={true}
		optionIdentifier="id"
		TopItem={withGeolocationButton ? TopItem : undefined}
		TopItemHandleClick={() => handleUserLocation()}
		placeholder={placeholder}
		inputAttributes={{ style: "cursor: pointer !important;" }}
		Item={CityItem}
		noOptionsMessage="Aucune correspondance trouvée pour cette adresse"
		bind:selectedValue={selectedAddress}
		containerStyles="height: 60px; font-weight: 600; color: #4a5568; {containerStyles}"
	/>
</div>

<style lang="scss">
	.themed {
		display: contents;
		--cursor: text;
		--padding: 22px 16px;
		--borderFocusColor: #a0aec0;
		--borderHoverColor: #a0aec0;
		--border: 1px solid #cbd5e0;
		--placeholderColor: #ff4081;
		--inputPadding: 45px;
		--inputColor: #205164;
		--indicatorTop: 16px;
		--indicatorColor: #ff4081;
	}
</style>

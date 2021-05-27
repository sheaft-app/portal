<script>
	import {onMount, getContext} from "svelte";
	import ChooseImage from "./ChooseImage.svelte";
	import {getNextId} from "../helpers/app";
	import Sortable from "sortablejs";
	import Icon from "svelte-awesome";
	import {
		faTrash,
		faPlus,
	} from "@fortawesome/free-solid-svg-icons";

	export let elements = [],
		elementHeight = 100,
		elementWidth = 100,
		newElementMinWidth = 100,
		newElementMinHeight = 100,
		newElementMaxWidth = null,
		newElementMaxHeight = null,
		containerMaxHeight = 600,
		containerMaxWidth = 800,
		imageSmoothing = true,
	 defaultSrcProperty = 'large';

	const {open} = getContext("modal");
	let buttonAddSize = parseInt(elementHeight) < parseInt(elementWidth) ? elementHeight : elementWidth;

	const addElement = () => {
		open(ChooseImage, {
			newElementMinWidth,
			newElementMinHeight,
			newElementMaxWidth : newElementMaxWidth ? newElementMaxWidth : newElementMinWidth,
			newElementMaxHeight : newElementMaxHeight ? newElementMaxHeight : newElementMinHeight,
			containerMaxHeight,
			containerMaxWidth,
			imageSmoothing,
			onClose: (res) => {
				if (res.success) {
					elements = [...elements, {
						id: `${incrementer.next().value}`,
						data: res.data,
						position: elements.length,
						new: true
					}];
				}
			},
		});
	};

	const removeElement = (id) => {
		elements = elements.filter(p => p.id !== id);
	}

	onMount(() => {
		let position = 0;
		elements = elements.map(p => {
			p.position = position;
			if(!p.id)
				p.id = incrementer.next().value;

			position++;
			return p;
		})

		let el = document.getElementById('elements');
		let sortable = Sortable.create(el, {
			animation: 150,
			filter: '.add-element',
			onEnd: (evt) => {
				if (evt.oldIndex == evt.newIndex)
					return;

				let itemEl = evt.item;
				let id = itemEl.getAttribute("data-id");

				elements = elements.map(p => {
					if (p.position >= evt.newIndex && p.id !== id)
						p.position++;
					else if (p.id === id)
						p.position = evt.newIndex;

					return p;
				});
			},
		});
	});

	const incrementer = getNextId();

</script>
<div class="border border-gray-400 cursor-pointer text-center h-full">
	<div id="elements" class="flex flex-wrap">
		{#if elements && elements.length > 0}
			{#each elements as element}
				<div data-id="{element.id}" class="element preview relative m-2 shadow"
						 style="background: url('{element.data ? element.data : element[defaultSrcProperty]}'); height: {elementHeight}px; width:{elementWidth}px;">
					<div class="absolute cursor-pointer btn-outline rounded-full remove-element"
							 style="top:5px; right: 5px; height: 30px; width:30px;"
							 on:click={() => removeElement(element.id)}>
						<Icon data="{faTrash}"/>
					</div>
				</div>
			{/each}
		{/if}
		<div class="add-element element cursor-pointer p-6 m-2 rounded-md btn-outline hover:btn-accent"
				 on:click={()=> addElement()}
				 style="height: {buttonAddSize}px; width:{buttonAddSize}px;">
			<Icon data={faPlus}/>
		</div>
	</div>
</div>

<style lang="scss">
	.remove-element {
		background-color: white;
	}

	.preview {
		background-size: contain !important;
		background-position: center !important;
		background-repeat: no-repeat !important;
		background-color: white !important;
	}
</style>

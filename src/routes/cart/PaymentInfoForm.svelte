<script>
  import { onMount } from "svelte";
  import { cartItems } from "./../../stores/app";
  import Icon from "svelte-awesome";
  import { faUser, faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
	import { fly } from "svelte/transition";

  let card = {
    name: null,
    number: null,
    cvc: null,
    expiry: null
  };
</script>

<div in:fly|local={{ x: 300, duration: 300 }}>
  <div class="bg-white shadow px-5 py-3 rounded mt-5 ">
    <div class="flex">
      <Icon data={faUser} class="mr-2" />
      <div>
        <p>Mugnier Geoffrey</p>
        <p>15/07/1997</p>
        <p>geoffrey.mugnier@outlook.com</p>
      </div>
    </div>
    <div class="flex">
      <Icon data={faMapMarkerAlt} class="mr-2" />
      <div>
        <p>285 Route de Braille</p>
        <p>73410 Entrelacs</p>
      </div>
    </div>
  </div>

  <div class="bg-white shadow px-5 py-3 rounded mt-5">
    {#each $cartItems as cartItem}
      <p>{cartItem.name}</p>
      <p>{cartItem.producer.name}</p>
    {/each}
  </div>
</div>
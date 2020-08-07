<script>
  import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
  import Icon from "svelte-awesome";
  import { fade } from "svelte/transition";

  export let icon = faCircleNotch,
    color = "#a0aec0",
    text = null;
</script>

<div
  style="color:{color}"
  class="h-full flex text-xl text-center items-center justify-center">
  <div>
    <Icon data={icon} scale="4" spin class="inline text-primary opacity-75" />
    {#if text}
      <p class="py-2">{text}</p>
    {/if}
  </div>
</div>

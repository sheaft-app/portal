<script>
  export let checked,
    onClick = null,
    sign = "o",
    classes = null;
</script>

<input
  type="checkbox"
  class="cbx"
  name="checkbox"
  style="display: none;"
  on:click|stopPropagation={onClick}
  bind:checked />
<label style="margin: 0;" for="cbx" class="cursor-pointer w-6 h-6 items-center justify-center check shadow rounded-full hover:bg-gray-100 {classes}" on:click={onClick}>{sign}</label>

<style lang="scss">
  input.cbx + .check {
    background-color: #ffffff;
    display: flex !important;
  }
  input.cbx:checked + .check {
    @apply bg-accent;
    color: #ffffff;
  }
</style>

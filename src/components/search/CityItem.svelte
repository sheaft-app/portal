<script>
    import Icon from "svelte-awesome";
    import { faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
    export let item = null;
</script>

<div class="cursor-pointer py-2 px-1 border-b border-gray-300 border-solid hover:bg-gray-200 flex items-center">
    <Icon data={faMapMarkerAlt} class="mr-5 ml-3" />
    <div>
        <p class="font-semibold">{item.line1}</p>
        <p class="text-sm font-normal">{item.zipcode} {item.city}</p>
    </div>
</div>
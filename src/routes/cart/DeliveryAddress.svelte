<script>
    import cart from "./../../stores/cart";
    import { onMount } from "svelte";
    import { format } from "date-fns";
    import fr from "date-fns/locale/fr";
    import DeliveryKind from './../../enums/DeliveryKind.js';
    import Icon from "svelte-awesome";
    import { faMapMarkerAlt, faClock } from "@fortawesome/free-solid-svg-icons";
    import { timeSpanToFrenchHour } from "./../../helpers/app.js";
    
    export let producerName, producerId;

    let delivery = null;

    onMount(() => {
        const data = $cart.selectedDeliveries.find(p => p.producerId == producerId);

        if (!data) {
            return;
        }

        delivery = {
            address: data.delivery.address,
            kind: data.delivery.kind,
            day: format(new Date(data.deliveryHour.expectedDeliveryDate), 'PPPP', { locale: fr }),
            from: data.deliveryHour.from,
            to: data.deliveryHour.to
        }
    })
</script>

{#if delivery}
    <div class="px-5 py-2 bg-gray-200 border-gray-400 border">
        <p class="font-semibold uppercase text-sm mb-2 pb-2 border-b border-gray-300">
            {producerName}
        </p>
        <div class="block md:flex md:flex-row">
            <div class="flex w-full">
                <Icon data={faMapMarkerAlt} class="mr-2 w-4 mt-1" />
                <div>
                    <p class="uppercase text-sm font-medium">
                    {DeliveryKind.label(delivery.kind)}
                    </p>
                    {#if delivery.address}
                    <p class="uppercase text-sm font-medium">{delivery.address.line1}</p>
                    {#if delivery.address.line2}
                        <p class="uppercase text-sm font-medium">
                        {delivery.address.line2}
                        </p>
                    {/if}
                    <p class="uppercase text-sm font-medium">
                        {delivery.address.zipcode} {delivery.address.city}
                    </p>
                    {/if}
                </div>
            </div>
            <div class="flex w-full mt-2 md:mt-0">
                <Icon data={faClock} size=".8" class="mr-2 w-4 mt-1" />
                <p class="uppercase text-sm font-medium">
                {delivery.day} <br/> de {`${timeSpanToFrenchHour(delivery.from)}`}
                à {`${timeSpanToFrenchHour(delivery.to)}`}
                </p>
            </div>
        </div>
    </div>
{/if}
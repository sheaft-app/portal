<script>
    import GetRouterInstance from "../../../services/SheaftRouter";
    import DeliveryBatchesRoutes from "../routes";
	import TransitionWrapper from "../../../components/TransitionWrapper.svelte";
	import PageHeader from "../../../components/PageHeader.svelte";
	import PageBody from "../../../components/PageBody.svelte";

    export let params = {};

    const routerInstance = GetRouterInstance();

    const chooseMode = mode => {
        if (mode == "realTime")
            return routerInstance.goTo(DeliveryBatchesRoutes.Process, { id: params.id });
        else
            return routerInstance.goTo(DeliveryBatchesRoutes.FlatProcess, { id: params.id })
    }
</script>

<TransitionWrapper>
	<PageHeader name="Choisissez un mode de livraison" previousPage={DeliveryBatchesRoutes.List} />
    <PageBody isLoading={false}>
        <div class="shadow px-4 py-2 mb-2 cursor-pointer" 
            on:click={() => chooseMode("realTime")} 
        >
            <p class="font-semibold">Je fais ma livraison en temps réel</p>
            <p>Utilisez votre téléphone ou votre tablette pour valider chaque étape de la livraison en temps réel.</p>
        </div>
        <div class="shadow px-4 py-2 cursor-pointer" 
            on:click={() => chooseMode("postDelivery")} 
        >
            <p class="font-semibold">Ma livraison est déjà faite, je fais le bilan</p>
            <p>Si la livraison a déjà été faite, vous pouvez utiliser ce mode pour faire un récapitulatif de celle-ci.</p>
        </div>
	</PageBody>
</TransitionWrapper>
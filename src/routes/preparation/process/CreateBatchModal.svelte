<script>
    import ActionConfirm from "../../../components/modal/ActionConfirm.svelte";
    import { CREATE_BATCH } from "../mutations";
    import { getContext } from "svelte";
    import { faCheck } from "@fortawesome/free-solid-svg-icons";
    import SheaftErrors from "../../../services/SheaftErrors";
    import { getIsoDate } from "../../../helpers/app";
    import DatePickerWrapper from "./../../../components/controls/DatePickerWrapper.svelte";
    import Toggle from "../../../components/controls/Toggle.svelte";
    import { GET_BATCHES } from "../queries";
    
    export let close, onClose;

    const errorsHandler = new SheaftErrors();
	const { mutate } = getContext("api");

    let number, dlc, dluo, comment = null, provideDlc = true, provideDluo = true, isLoading = false;

    const handleSubmit = async () => {
        // todo
        console.log(dlc, dluo);

        await mutate({
            mutation: CREATE_BATCH,
            variables: { 
                number,
                dlc : provideDlc ? getIsoDate(dlc) : null,
                dluo: provideDluo ? getIsoDate(dluo) : null,
                comment
            },
            errorsHandler,
            success: async (res) => {
                await onClose(res);
                close();
            },
            errorNotification: "Impossible de créer le lot",
            clearCache: [GET_BATCHES]
        })
    }
</script>

<ActionConfirm
	{errorsHandler}
	title="Créer un lot"
	submit={handleSubmit}
	{isLoading}
    {close}
    valid={number && (provideDlc || provideDluo)}
	submitText="Confirmer"
	icon={faCheck}
	closeText="Fermer"
>
<div class="form-control text-left">
    <label for="reason">Numéro du lot *</label>
    <input
        bind:value={number}
        id="batch"
        type="text"
    />
</div>
<div class="form-control text-left" style="display:block;">
    <label>DLC *</label>
    <Toggle bind:isChecked={provideDlc}>
        Le lot possède une DLC
    </Toggle>
    {#if provideDlc}
        <DatePickerWrapper bind:selected={dlc} dateChosen={true} />
    {/if}
</div>
<div class="form-control text-left" style="display:block;">
    <label>DLUO *</label>
    <Toggle bind:isChecked={provideDluo}>
        Le lot possède une DLUO
    </Toggle>
    {#if provideDluo}
        <DatePickerWrapper bind:selected={dluo} dateChosen={true} />
    {/if}
</div>
<div class="form-control">
    {#if !provideDluo && !provideDlc}
        <p class="text-red-500">Le lot doit avoir au moins une DLC ou une DLUO</p>
    {/if}
</div>
<div class="form-control text-left">
    <label for="reason">Commentaire</label>
    <textarea
        bind:value={comment}
        id="comment"
        type="text"
    />
</div>

<small>* champs requis</small>
</ActionConfirm>
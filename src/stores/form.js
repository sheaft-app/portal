import { get, writable } from "svelte/store";
import { form } from '../../vendors/svelte-forms/src/index';

export const getDefaultFields = (values, initialValues, notRequiredValues = []) => Object.keys(values).reduce((acc, k) => {
    if (Object.keys(initialValues).includes(k)) 
        acc[k] = { value: values[k], validators: ['required'], enabled: !notRequiredValues.includes(k) };
    return acc;
}, {});

const store = () => {
    let formBind;
    let unsubscribe;

	const state = {
        isInitializing: true,
        isSubmitting: false,
        fields: {},
        oldFields: {},
        dirty: false,
        valid: false
	}

	const { subscribe, set, update } = writable(state);

	const methods = {
		initialize(values, getFields, initialValues) {

            // complete object with missing values
            values = {
                ...initialValues,
                ...values
            };

            formBind = form(() => getFields(values), {
                initCheck: false
            });

            unsubscribe = formBind.subscribe((e) => {
                update((state) => {
                    state.fields = get(formBind).fields;
                    state.oldFields = get(formBind).oldFields;
                    state.dirty = get(formBind).dirty;
                    state.valid = get(formBind).valid;
                    return state;
                });
            });

            update(state => {
                state.isInitializing = false;
                return state;
            })
            
            return values;
        },
        async validateAndSubmit(submit) {
            formBind.validate();
            
            if (state.valid && !state.isInitializing && !state.isSubmitting) {
                update((state) => {
                    state.isSubmitting = true;
                    return state;
                });

                await submit();

                update((state) => {
                    state.isSubmitting = false;
                    return state;
                });
            }
        },
        destroy() {
            unsubscribe();
            formBind = undefined;
            update((state) => {
                state.fields = {};
                state.oldFields = {};
                state.dirty = false;
                state.valid = false;
                return state;
            })
        }
    };

    const getters = {
        values() {
            let normalizedData = {};
            Object.values(state.fields).map((v) => normalizedData[v.data.name] = v.data.value);
            return normalizedData;
        }
    };
    
	return {
		subscribe,
		set,
        update,
        ...getters,
        ...methods
	}
}

export default store()

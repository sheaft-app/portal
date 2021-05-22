import { getDefaultFields } from "../../stores/form";
import omit from "lodash/omit";

export const initialValues = {
    id: null,
    firstName: null,
    lastName: null,
    email: null,
    facebook: null,
    instagram: null
};

export const validators = (consumer) => ({
    ...getDefaultFields(consumer, initialValues, ['facebook', 'instagram']),
    email: { value: consumer.email, validators: ['required', 'email'], enabled: true },
});

export const normalizeConsumer = consumer => omit({
        ...consumer
}, ['openingHours', 'tags']);

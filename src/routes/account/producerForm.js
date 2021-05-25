import { getDefaultFields } from "../../stores/form";
import omit from "lodash/omit";

export const initialValues = {
    id: null,
    name: null,
    firstName: null,
    lastName: null,
    email: null,
    phone: null,
    summary: "",
    description: "",
    facebook: null,
    instagram: null,
    website: null,
    address: {
        line1: null,
        line2: null,
        city: null,
        zipcode: null,
        country: "FR"
    },
    openForNewBusiness: true
};

export const validators = (producer) => ({
    ...getDefaultFields(producer, initialValues, ['facebook', 'instagram', 'website', 'phone']),
    email: { value: producer.email, validators: ['required', 'email'], enabled: true },
    summary: { value: producer.summary, validators: ['maxLength:300'], enabled: producer.summary && producer.summary.length > 0 },
    description: { value: producer.description, validators: ['maxLength:1500'], enabled: producer.description && producer.description.length > 0 }
});

export const normalizeProducer = producer => omit({
    ...producer,
}, ['openingHours', 'tags']);

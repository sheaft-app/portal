import { getDefaultFields } from "../../stores/form";
import ConditioningKind from "../../enums/ConditioningKind";

export const initialValues = {
    reference: null,
    unit: null,
    quantityPerUnit: null,
    vat: null,
    name: null,
    conditioning: ConditioningKind.Bulk.Value,
    returnableId: null,
    description: null,
    picture: null,
    tags: [],
    available: true,
    visibleToStores: true,
    visibleToConsumers: true,
    catalogs:[],
    producer: {
        notSubjectToVat: false
    }
};

export const validators = (product) => ({
    ...getDefaultFields(product, initialValues, ['reference', 'returnableId', 'description', 'picture']),
    name: {
        value: product.name,
        validators: ["required", "min:3"],
        enabled: true,
    },
    vat: {value: product.vat, validators: ["required"], enabled: !product.notSubjectToVat},
    unit: {
        value: product.unit,
        validators: ["required"],
        enabled: product.conditioning == ConditioningKind.Bulk.Value
    },
    quantityPerUnit: {
        value: product.quantityPerUnit,
        validators: ["required", "min:0.01"],
        enabled: product.conditioning !== ConditioningKind.Bunch.Value && product.conditioning !== ConditioningKind.Bouquet.Value,
    }
});

export const normalizeCreateProduct = product => ({
    description: product.description,
    name: product.name,
    catalogs: product.catalogs.map((c) => ({
        id: c.id,
        wholeSalePricePerUnit: c.wholeSalePricePerUnit
    })),
    returnableId: product.returnable ? product.returnable.id : null,
    quantityPerUnit: product.quantityPerUnit,
    unit: product.unit,
    conditioning: product.conditioning,
    reference: product.reference,
    picture: product.picture ? product.picture : null,
    originalPicture: product.originalPicture ? product.originalPicture : null,
    tags: product.tags.map(i => i.id),
    vat: product.vat,
    available: product.available
});

export const normalizeUpdateProduct = product => ({
    ...normalizeCreateProduct(product),
    catalogs: product.catalogs.filter((c) => !c.markForDeletion).map((c) => ({
        id: c.id,
        wholeSalePricePerUnit: c.wholeSalePricePerUnit
    }))
})
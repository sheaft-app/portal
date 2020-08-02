import GetEnumObjectFor from './helpers.js';

let enums = {
    Category : { Value: "CATEGORY", Label: "Catégorie"},
    Label : { Value: "LABEL", Label: "Label"},
    Diet: { Value: "DIET", Label: "Régime alimentaire"},
    Allergen : { Value: "ALLERGEN", Label: "Allergène"},
    Ingredient: { Value: "INGREDIENT", Label: "Ingrédient"}
}

let TagKind = {	
	get: (value) => {
		return GetEnumObjectFor(enums, value);
	},
	label: (value) => {
		return GetEnumObjectFor(enums, value).Label;
	},
	value: (value) => {
		return GetEnumObjectFor(enums, value).Value;
	},
	color: (value) => {
		return GetEnumObjectFor(enums, value).Color;
	},
	icon: (value) => {
		return GetEnumObjectFor(enums, value).Icon;
	}
};

Object.keys(enums).map(key => TagKind[key] = enums[key]);
Object.freeze(TagKind);

export default TagKind;
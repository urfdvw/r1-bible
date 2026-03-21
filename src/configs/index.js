import appConfigSchemaJson from "./app.json";

const appConfigSchema = {
    ...appConfigSchemaJson,
    legacyKeys: ["bible_display", "general"],
};

const schemas = [appConfigSchema];
export default schemas;
export { appConfigSchema };

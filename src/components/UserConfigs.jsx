import { useContext, useEffect, useState } from "react";
import Form from "@rjsf/mui";
import validator from "@rjsf/validator-ajv8";
import AppContext from "../AppContext";
import { appConfigSchema } from "../configs";

const uiSchema = {
    "ui:submitButtonOptions": {
        "submitText": "应用设置",
    },
};

export default function UserConfigs() {
    const { settings, setSettings } = useContext(AppContext);
    const [formData, setFormData] = useState(settings);

    useEffect(() => {
        setFormData(settings);
    }, [settings]);

    return (
        <div style={{ padding: "16px", boxSizing: "border-box" }}>
            <Form
                formData={formData}
                schema={appConfigSchema}
                uiSchema={uiSchema}
                validator={validator}
                onSubmit={(event) => {
                    setSettings(event.formData);
                }}
                onChange={(event) => {
                    setFormData(event.formData);
                }}
                omitExtraData={true}
            />
        </div>
    );
}

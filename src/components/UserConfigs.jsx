import { Suspense, lazy, useContext } from "react";
import AppContext from "../AppContext";
import schemas from "../configs";

const ConfigForms = lazy(() => import("../utilComponents/react-user-config/ConfigForms"));

export default function UserConfigs() {
    const { appConfig, configTabSelection, isMobileReadingMode } = useContext(AppContext);
    const visibleSchemas = isMobileReadingMode
        ? schemas.filter((schema) => ["bible_display", "general"].includes(schema.name))
        : schemas;
    const visibleTabValue = Math.max(
        0,
        visibleSchemas.findIndex((schema) => schema.name === configTabSelection.tabName)
    );

    return (
        <Suspense fallback={null}>
            <ConfigForms
                schemas={visibleSchemas}
                config={appConfig.config}
                setConfig={appConfig.setConfig}
                tabValue={visibleTabValue}
                setTabValue={(tabValue) => {
                    const nextSchema = visibleSchemas[tabValue];
                    if (nextSchema) {
                        configTabSelection.setTabName(nextSchema.name);
                    }
                }}
            />
        </Suspense>
    );
}

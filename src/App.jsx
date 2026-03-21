import { useCallback, useState } from "react";
import "./App.css";
import AppContext from "./AppContext";
import * as FlexLayout from "flexlayout-react";
import Factory from "./layout/Factory";
import layoutJson from "./layout/layout.json";
import "flexlayout-react/style/light.css";
import DarkTheme from "react-lazy-dark-theme";
import useConfig from "./utilComponents/react-user-config/useConfig";
import schemas from "./configs";
import bible from "./bible";
import useBibleData from "./bible/useBibleData";
import usePreviewTabs from "./utilHooks/usePreviewTabs";
import TipsModal from "./components/TipsModal";
import { tips } from "./tips";
import useAppViewportHeight from "./utilHooks/useAppViewportHeight";

const defaultSettings = {
    language: "中文",
    chinese: "简体",
    english: "ASV",
    contrast_layout: "前后",
    range_location: "开头",
    theme: "跟随系统",
    show_tips_on_startup: "是",
};

function App() {
    useAppViewportHeight();

    const [flexModel] = useState(() => FlexLayout.Model.fromJson(layoutJson));
    const appConfig = useConfig(schemas);
    const settings = appConfig.config.app || defaultSettings;
    const { getMultipleVerses, getChapterVerses, getBookMeta } = useBibleData(bible, settings);
    const { setPreviewVerse, getPreviewVerseForTab, setPreviewVerseForTab, handleRenderTabSet, handleLayoutModelChange } =
        usePreviewTabs(flexModel, settings);

    const setSettings = useCallback(
        (nextSettings) => {
            appConfig.setConfig("app", nextSettings);
        },
        [appConfig]
    );
    const setSetting = useCallback(
        (fieldName, fieldValue) => {
            appConfig.setConfigField("app", fieldName, fieldValue);
        },
        [appConfig]
    );
    const collapseBottomPanel = useCallback(() => {
        const tabNode = flexModel.getNodeById("bible_toc_tab") || flexModel.getNodeById("config_tab");
        if (!tabNode) {
            return;
        }
        const parent = tabNode.getParent();
        if (!parent || parent.getType() !== "border") {
            return;
        }
        flexModel.doAction(FlexLayout.Actions.updateNodeAttributes(parent.getId(), { selected: -1 }));
    }, [flexModel]);

    let dark = null;
    let highContrast = false;
    if (settings.theme === "白天") {
        dark = false;
    } else if (settings.theme === "夜间") {
        dark = true;
    } else if (settings.theme === "夜间投影") {
        dark = true;
        highContrast = true;
    }

    if (!appConfig.ready) {
        return null;
    }

    return (
        <AppContext.Provider
            value={{
                flexModel,
                settings,
                setSettings,
                setSetting,
                getMultipleVerses,
                getChapterVerses,
                getBookMeta,
                setPreviewVerse,
                getPreviewVerseForTab,
                setPreviewVerseForTab,
                collapseBottomPanel,
            }}
        >
            <DarkTheme dark={dark} highContrast={highContrast} />
            <div className="app">
                <TipsModal tips={tips} showOnStartup={settings.show_tips_on_startup !== "否"} />
                <div className="app-body">
                    <FlexLayout.Layout
                        model={flexModel}
                        factory={Factory}
                        onRenderTabSet={handleRenderTabSet}
                        onModelChange={handleLayoutModelChange}
                    />
                </div>
            </div>
        </AppContext.Provider>
    );
}

export default App;

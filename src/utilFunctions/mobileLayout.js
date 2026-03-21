import baseLayout from "../layout/layout.json";

export function createLayoutJsonForMode(mobileReadingMode) {
    const nextLayout = JSON.parse(JSON.stringify(baseLayout));
    if (!mobileReadingMode) {
        return nextLayout;
    }

    const mobileBottomTabIds = ["bible_toc_tab", "config_tab"];
    const mobileBottomTabs = mobileBottomTabIds
        .map((tabId) =>
            (nextLayout.borders || [])
                .flatMap((border) => border.children || [])
                .find((tab) => tab.id === tabId)
        )
        .filter(Boolean)
        .map((tab) => ({ ...tab }));

    nextLayout.borders = [
        {
            type: "border",
            location: "bottom",
            size: 300,
            selected: -1,
            children: mobileBottomTabs,
        },
    ];

    if (nextLayout.layout?.children) {
        nextLayout.layout.children = nextLayout.layout.children.filter(
            (tabset) => !(tabset.children || []).some((tab) => tab.component === "projector")
        );
    }
    return nextLayout;
}

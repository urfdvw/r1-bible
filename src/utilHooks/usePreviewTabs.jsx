import { useCallback, useEffect, useRef, useState } from "react";
import * as FlexLayout from "flexlayout-react";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/AddOutlined";
import VerseRef from "../models/VerseRef";
import { enNames, siNames, trNames } from "../bible";

const PREVIEW_COMPONENT = "preview";
const DEFAULT_PREVIEW_TAB_ID = "preview_tab_1";
const DEFAULT_PREVIEW_VERSE = new VerseRef({ book: 43, chapter: 3, verse: 16 });
const PREVIEW_TABS_STORAGE_KEY = "preview_tabs_cache";

const STRUCTURE_ACTIONS = new Set([
    FlexLayout.Actions.ADD_NODE,
    FlexLayout.Actions.DELETE_TAB,
    FlexLayout.Actions.MOVE_NODE,
]);

function readPreviewTabsCache() {
    if (typeof window === "undefined") {
        return null;
    }
    try {
        const raw = window.localStorage.getItem(PREVIEW_TABS_STORAGE_KEY);
        if (!raw) {
            return null;
        }
        const parsed = JSON.parse(raw);
        if (!parsed || !Array.isArray(parsed.tabs) || parsed.tabs.length === 0) {
            return null;
        }
        return {
            tabs: parsed.tabs.map((verseObj) => VerseRef.from(verseObj)),
            activeIndex: Number.isInteger(parsed.activeIndex) ? parsed.activeIndex : 0,
        };
    } catch (error) {
        console.error("Failed to read preview tab cache", error);
        return null;
    }
}

function writePreviewTabsCache(tabs, activeIndex) {
    if (typeof window === "undefined") {
        return;
    }
    try {
        window.localStorage.setItem(
            PREVIEW_TABS_STORAGE_KEY,
            JSON.stringify({
                tabs: tabs.map((verseRef) => VerseRef.from(verseRef).toJSON()),
                activeIndex,
            })
        );
    } catch (error) {
        console.error("Failed to write preview tab cache", error);
    }
}

function isPreviewTabNode(node) {
    return (
        node &&
        node.getType() === "tab" &&
        typeof node.getComponent === "function" &&
        node.getComponent() === PREVIEW_COMPONENT
    );
}

function getPreviewTabsets(model) {
    const tabsets = [];
    model.visitNodes((node) => {
        if (node.getType() !== "tabset") {
            return;
        }
        const previewTabs = node.getChildren().filter((child) => isPreviewTabNode(child));
        if (previewTabs.length > 0) {
            tabsets.push({ tabset: node, previewTabs });
        }
    });
    return tabsets;
}

function getAllPreviewTabs(model) {
    return getPreviewTabsets(model).flatMap((entry) => entry.previewTabs);
}

function getBookNames(bibleDisplayConfig) {
    if (bibleDisplayConfig?.language === "English") {
        return enNames;
    }
    if (bibleDisplayConfig?.chinese === "繁體") {
        return trNames;
    }
    return siNames;
}

function isSameVerseRef(a, b) {
    if (!a || !b) {
        return false;
    }
    return (
        a.book === b.book &&
        a.chapter === b.chapter &&
        a.verse === b.verse &&
        a.endChapter === b.endChapter &&
        a.endVerse === b.endVerse &&
        a.note === b.note
    );
}

function findPreferredPreviewTabId(model, preferredTabId) {
    const selectedPreviewTab = getAllPreviewTabs(model).find((tabNode) => tabNode.isSelected());
    if (selectedPreviewTab) {
        return selectedPreviewTab.getId();
    }

    const preferredNode = preferredTabId ? model.getNodeById(preferredTabId) : undefined;
    if (isPreviewTabNode(preferredNode)) {
        return preferredTabId;
    }

    const firstPreviewTab = getAllPreviewTabs(model)[0];
    return firstPreviewTab ? firstPreviewTab.getId() : undefined;
}

export default function usePreviewTabs(flexModel, bibleDisplayConfig) {
    const [previewVersesByTabId, setPreviewVersesByTabId] = useState({
        [DEFAULT_PREVIEW_TAB_ID]: DEFAULT_PREVIEW_VERSE,
    });
    const [latestActivePreviewTabId, setLatestActivePreviewTabId] = useState(DEFAULT_PREVIEW_TAB_ID);
    const previewTabCounterRef = useRef(2);
    const internalActionDepthRef = useRef(0);
    const hasRestoredCacheRef = useRef(false);
    const currentBookNames = getBookNames(bibleDisplayConfig);

    const doInternalAction = useCallback(
        (action) => {
            internalActionDepthRef.current += 1;
            try {
                flexModel.doAction(action);
            } finally {
                internalActionDepthRef.current -= 1;
            }
        },
        [flexModel]
    );

    const getLatestPreviewTabId = useCallback(() => {
        return findPreferredPreviewTabId(flexModel, latestActivePreviewTabId);
    }, [flexModel, latestActivePreviewTabId]);

    const persistPreviewTabs = useCallback(
        (model, versesByTabId = previewVersesByTabId, preferredTabId = latestActivePreviewTabId) => {
            if (!hasRestoredCacheRef.current) {
                return;
            }
            const previewTabs = getAllPreviewTabs(model);
            if (previewTabs.length === 0) {
                return;
            }
            const tabs = previewTabs.map((tabNode) => versesByTabId[tabNode.getId()] || DEFAULT_PREVIEW_VERSE);
            const activeTabId = findPreferredPreviewTabId(model, preferredTabId) || previewTabs[0].getId();
            const activeIndex = Math.max(
                0,
                previewTabs.findIndex((tabNode) => tabNode.getId() === activeTabId)
            );
            writePreviewTabsCache(tabs, activeIndex);
        },
        [latestActivePreviewTabId, previewVersesByTabId]
    );

    const setPreviewVerseForTab = useCallback((tabId, verseObj) => {
        if (!tabId) {
            return;
        }
        const normalized = VerseRef.from(verseObj);
        setPreviewVersesByTabId((map) => {
            const existing = map[tabId];
            if (existing && isSameVerseRef(existing, normalized)) {
                return map;
            }
            return { ...map, [tabId]: normalized };
        });
    }, []);

    const getPreviewVerseForTab = useCallback(
        (tabId) => {
            if (tabId && previewVersesByTabId[tabId]) {
                return previewVersesByTabId[tabId];
            }
            return DEFAULT_PREVIEW_VERSE;
        },
        [previewVersesByTabId]
    );

    const setPreviewVerse = useCallback(
        (verseObj) => {
            const tabId = getLatestPreviewTabId();
            if (!tabId) {
                return;
            }
            setPreviewVerseForTab(tabId, verseObj);
        },
        [getLatestPreviewTabId, setPreviewVerseForTab]
    );

    const syncPreviewStructureRules = useCallback(
        (model) => {
            const previewTabsets = getPreviewTabsets(model);
            const allPreviewTabs = previewTabsets.flatMap((entry) => entry.previewTabs);

            previewTabsets.forEach(({ previewTabs }) => {
                previewTabs.forEach((tabNode, index) => {
                    const shouldEnableClose = index > 0;
                    if (tabNode.isEnableClose() !== shouldEnableClose) {
                        doInternalAction(
                            FlexLayout.Actions.updateNodeAttributes(tabNode.getId(), { enableClose: shouldEnableClose })
                        );
                    }
                });
            });

            const previewTabIds = new Set(allPreviewTabs.map((tabNode) => tabNode.getId()));
            setPreviewVersesByTabId((map) => {
                const entries = Object.entries(map).filter(([tabId]) => previewTabIds.has(tabId));
                const filtered = Object.fromEntries(entries);
                const isUnchanged =
                    entries.length === Object.keys(map).length &&
                    entries.every(([tabId, verse]) => map[tabId] === verse);

                if (isUnchanged) {
                    return map;
                }

                if (Object.keys(filtered).length === 0) {
                    const fallbackTabId = allPreviewTabs[0]?.getId();
                    if (fallbackTabId) {
                        filtered[fallbackTabId] = VerseRef.from(DEFAULT_PREVIEW_VERSE);
                    }
                }
                return filtered;
            });

            setLatestActivePreviewTabId((prev) => {
                const next = findPreferredPreviewTabId(model, prev);
                return next || prev;
            });
        },
        [doInternalAction]
    );

    const syncPreviewTabNames = useCallback(
        (model) => {
            const allPreviewTabs = getAllPreviewTabs(model);

            allPreviewTabs.forEach((tabNode) => {
                const tabVerse = previewVersesByTabId[tabNode.getId()] || DEFAULT_PREVIEW_VERSE;
                const bookName = tabVerse?.book ? currentBookNames[tabVerse.book] : null;
                const chapter = tabVerse?.chapter;
                const defaultBookName = currentBookNames[DEFAULT_PREVIEW_VERSE.book];
                const expectedName = `${bookName || defaultBookName} ${chapter || DEFAULT_PREVIEW_VERSE.chapter}`;
                if (tabNode.getName() !== expectedName) {
                    doInternalAction(FlexLayout.Actions.updateNodeAttributes(tabNode.getId(), { name: expectedName }));
                }
            });
        },
        [currentBookNames, doInternalAction, previewVersesByTabId]
    );

    const addPreviewTabToTabset = useCallback(
        (tabsetId) => {
            const sourceTabId = getLatestPreviewTabId();
            const sourceVerse = sourceTabId ? getPreviewVerseForTab(sourceTabId) : DEFAULT_PREVIEW_VERSE;
            const newPreviewTabId = `preview_tab_${previewTabCounterRef.current++}`;

            flexModel.doAction(
                FlexLayout.Actions.addNode(
                    {
                        type: "tab",
                        id: newPreviewTabId,
                        name: "预览",
                        component: PREVIEW_COMPONENT,
                        enableClose: true,
                    },
                    tabsetId,
                    FlexLayout.DockLocation.CENTER,
                    -1,
                    true
                )
            );

            setPreviewVersesByTabId((map) => ({ ...map, [newPreviewTabId]: VerseRef.from(sourceVerse) }));
            setLatestActivePreviewTabId(newPreviewTabId);
        },
        [flexModel, getLatestPreviewTabId, getPreviewVerseForTab]
    );

    const handleRenderTabSet = useCallback(
        (tabSetNode, renderValues) => {
            if (tabSetNode.getType() !== "tabset") {
                return;
            }
            const hasPreviewTab = tabSetNode.getChildren().some((child) => isPreviewTabNode(child));
            if (!hasPreviewTab) {
                return;
            }
            renderValues.stickyButtons.push(
                <IconButton
                    key={`preview-add-${tabSetNode.getId()}`}
                    title="新增预览"
                    aria-label="新增预览"
                    size="small"
                    onClick={(event) => {
                        event.stopPropagation();
                        addPreviewTabToTabset(tabSetNode.getId());
                    }}
                >
                    <AddIcon fontSize="inherit" />
                </IconButton>
            );
        },
        [addPreviewTabToTabset]
    );

    const handleLayoutModelChange = useCallback(
        (model, action) => {
            if (internalActionDepthRef.current > 0) {
                return;
            }

            if (action.type === FlexLayout.Actions.SELECT_TAB) {
                const selectedTabId = action.data.tabNode;
                const selectedNode = model.getNodeById(selectedTabId);
                if (isPreviewTabNode(selectedNode)) {
                    setLatestActivePreviewTabId(selectedTabId);
                    persistPreviewTabs(model, previewVersesByTabId, selectedTabId);
                }
                return;
            }

            if (STRUCTURE_ACTIONS.has(action.type)) {
                syncPreviewStructureRules(model);
                persistPreviewTabs(model);
            }
        },
        [persistPreviewTabs, previewVersesByTabId, syncPreviewStructureRules]
    );

    const restorePreviewTabsFromCache = useCallback(() => {
        if (hasRestoredCacheRef.current) {
            return;
        }
        hasRestoredCacheRef.current = true;

        const cached = readPreviewTabsCache();
        if (!cached) {
            syncPreviewStructureRules(flexModel);
            return;
        }

        const previewTabset = getPreviewTabsets(flexModel)[0]?.tabset;
        const previewTabsetId = previewTabset?.getId();
        if (!previewTabsetId) {
            syncPreviewStructureRules(flexModel);
            return;
        }

        const existingPreviewTabs = getAllPreviewTabs(flexModel);
        existingPreviewTabs.slice(1).forEach((tabNode) => {
            doInternalAction(FlexLayout.Actions.deleteTab(tabNode.getId()));
        });

        const normalizedTabs = cached.tabs.map((verseObj, index) => ({
            id: `preview_tab_${index + 1}`,
            verse: VerseRef.from(verseObj),
        }));

        for (let index = 1; index < normalizedTabs.length; index += 1) {
            doInternalAction(
                FlexLayout.Actions.addNode(
                    {
                        type: "tab",
                        id: normalizedTabs[index].id,
                        name: "预览",
                        component: PREVIEW_COMPONENT,
                        enableClose: true,
                    },
                    previewTabsetId,
                    FlexLayout.DockLocation.CENTER,
                    -1,
                    false
                )
            );
        }

        const nextPreviewVersesByTabId = Object.fromEntries(
            normalizedTabs.map((tab) => [tab.id, VerseRef.from(tab.verse)])
        );
        setPreviewVersesByTabId(nextPreviewVersesByTabId);

        const maxActiveIndex = Math.max(0, normalizedTabs.length - 1);
        const activeIndex = Math.min(Math.max(cached.activeIndex, 0), maxActiveIndex);
        const activeTabId = normalizedTabs[activeIndex]?.id || DEFAULT_PREVIEW_TAB_ID;
        setLatestActivePreviewTabId(activeTabId);
        doInternalAction(FlexLayout.Actions.selectTab(activeTabId));

        previewTabCounterRef.current = normalizedTabs.length + 1;
        syncPreviewStructureRules(flexModel);
        persistPreviewTabs(flexModel, nextPreviewVersesByTabId, activeTabId);
    }, [doInternalAction, flexModel, persistPreviewTabs, syncPreviewStructureRules]);

    useEffect(() => {
        const previewTabIds = getAllPreviewTabs(flexModel).map((tabNode) => tabNode.getId());
        const maxIndex = previewTabIds.reduce((max, tabId) => {
            const match = /^preview_tab_(\d+)$/.exec(tabId);
            if (!match) {
                return max;
            }
            return Math.max(max, Number(match[1]));
        }, 1);
        previewTabCounterRef.current = maxIndex + 1;
        restorePreviewTabsFromCache();
    }, [flexModel, restorePreviewTabsFromCache]);

    useEffect(() => {
        syncPreviewTabNames(flexModel);
    }, [flexModel, syncPreviewTabNames]);

    useEffect(() => {
        persistPreviewTabs(flexModel);
    }, [flexModel, persistPreviewTabs, previewVersesByTabId, latestActivePreviewTabId]);

    const previewVerse = getPreviewVerseForTab(getLatestPreviewTabId());

    return {
        previewVerse,
        setPreviewVerse,
        getPreviewVerseForTab,
        setPreviewVerseForTab,
        handleRenderTabSet,
        handleLayoutModelChange,
    };
}

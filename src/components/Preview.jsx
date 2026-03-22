import AppContext from "../AppContext";
import { useCallback, useContext, useEffect, useRef } from "react";
import { PreviewVerseBox } from "./VerseBox";
import TabToolBar from "../utilComponents/TabToolBar";
import VerseRef from "../models/VerseRef";

function PreviewList({ previewVerse, tabId }) {
    const { getChapterVerses, setPreviewVerseForTab } = useContext(AppContext);
    const verses = getChapterVerses(previewVerse.book, previewVerse.chapter);
    const containerId = `previewContainer-${tabId}`;
    const latestTargetNameRef = useRef("");

    const scrollToTarget = useCallback(
        (targetName) => {
            const container = document.getElementById(containerId);
            if (!container) {
                return false;
            }
            const target = container.querySelector(`[data-preview-anchor="${targetName}"]`);
            if (!target) {
                return false;
            }
            const top =
                container.scrollTop + target.getBoundingClientRect().top - container.getBoundingClientRect().top;
            container.scrollTop = top;
            return true;
        },
        [containerId]
    );

    const handleSelectVerse = useCallback(
        (verseObj) => {
            const nextVerse = VerseRef.from(verseObj);
            const targetName = `preview-verse-${tabId}-${nextVerse.verse}`;
            latestTargetNameRef.current = targetName;
            scrollToTarget(targetName);
            setPreviewVerseForTab(tabId, nextVerse);
        },
        [scrollToTarget, setPreviewVerseForTab, tabId]
    );

    useEffect(() => {
        if (!previewVerse.verse) {
            return;
        }
        const targetName = `preview-verse-${tabId}-${previewVerse.verse}`;
        latestTargetNameRef.current = targetName;

        let cancelled = false;
        let rafId = 0;
        let attempts = 0;
        const maxAttempts = 12;

        const tryScroll = () => {
            if (cancelled) {
                return;
            }
            const scrolled = scrollToTarget(targetName);
            if (scrolled || attempts >= maxAttempts) {
                return;
            }
            attempts += 1;
            rafId = requestAnimationFrame(tryScroll);
        };
        tryScroll();

        return () => {
            cancelled = true;
            cancelAnimationFrame(rafId);
        };
    }, [previewVerse, scrollToTarget, tabId, verses.length]);

    useEffect(() => {
        const container = document.getElementById(containerId);
        if (!container) {
            return;
        }
        let rafId = 0;
        const resizeObserver = new ResizeObserver(() => {
            if (latestTargetNameRef.current) {
                if (rafId) {
                    cancelAnimationFrame(rafId);
                }
                rafId = requestAnimationFrame(() => scrollToTarget(latestTargetNameRef.current));
            }
        });
        resizeObserver.observe(container);
        return () => {
            if (rafId) {
                cancelAnimationFrame(rafId);
            }
            resizeObserver.disconnect();
        };
    }, [containerId, scrollToTarget]);

    return (
        <div id={containerId} style={{ height: "100%", overflowY: "auto", scrollBehavior: "auto" }}>
            {verses.map((verseVersions) => {
                const verseAnchorName = `preview-verse-${tabId}-${verseVersions[0].verse}`;
                return (
                    <div key={verseAnchorName} id={verseAnchorName} data-preview-anchor={verseAnchorName}>
                        <PreviewVerseBox
                            verseObj={
                                new VerseRef({
                                    book: verseVersions[0].book,
                                    chapter: verseVersions[0].chapter,
                                    verse: verseVersions[0].verse,
                                })
                            }
                            onClick={() =>
                                handleSelectVerse(
                                    new VerseRef({
                                        book: verseVersions[0].book,
                                        chapter: verseVersions[0].chapter,
                                        verse: verseVersions[0].verse,
                                    })
                                )
                            }
                        />
                    </div>
                );
            })}
        </div>
    );
}

export default function Preview({ tabId }) {
    const { getChapterVerses, getPreviewVerseForTab, setPreviewVerseForTab } = useContext(AppContext);
    const previewVerse = getPreviewVerseForTab(tabId);
    const verses = getChapterVerses(previewVerse.book, previewVerse.chapter);
    const title = verses[0]?.[0] ? `${verses[0][0].book_name} ${verses[0][0].chapter}` : "预览";

    const tools = [
        {
            text: "上一章",
            handler: () => {
                if (previewVerse.chapter <= 1) {
                    return;
                }
                setPreviewVerseForTab(
                    tabId,
                    new VerseRef({ book: previewVerse.book, chapter: previewVerse.chapter - 1, verse: 1 })
                );
            },
        },
        {
            text: "下一章",
            handler: () => {
                const nextChapterVerses = getChapterVerses(previewVerse.book, previewVerse.chapter + 1);
                if (nextChapterVerses.length === 0) {
                    return;
                }
                setPreviewVerseForTab(
                    tabId,
                    new VerseRef({ book: previewVerse.book, chapter: previewVerse.chapter + 1, verse: 1 })
                );
            },
        },
    ];

    return (
        <div style={{ display: "flex", height: "100%", flexDirection: "column" }}>
            <div style={{ flexGrow: 0 }}>
                <TabToolBar title={title} tools={tools} />
            </div>
            <PreviewList previewVerse={previewVerse} tabId={tabId} />
        </div>
    );
}

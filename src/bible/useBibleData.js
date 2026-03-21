import { getMultipleVerses, getChapterVerses, getBookMeta } from "./utils";

export default function useBibleData(bible, settings) {
    function _getSelectedVersions() {
        const ChineseVersion = settings.chinese === "简体" ? bible.cuvs : bible.cuvt;
        const EnglishVersion =
            settings.english === "KJV"
                ? bible.kjv
                : settings.english === "ASV"
                ? bible.asv
                : bible.web;
        let versions = [];
        if (settings.language === "中文") {
            versions = [ChineseVersion];
        } else if (settings.language === "English") {
            versions = [EnglishVersion];
        } else if (settings.language === "对照") {
            versions = [ChineseVersion, EnglishVersion];
        }
        return versions;
    }

    function _getMultipleVerses(verseRef) {
        const versions = _getSelectedVersions();
        return getMultipleVerses(versions, verseRef);
    }

    function _getChapterVerses(book, chapter) {
        const versions = _getSelectedVersions();
        return getChapterVerses(versions, book, chapter);
    }

    function _getBookMeta(book) {
        const versions = _getSelectedVersions();
        return getBookMeta(versions, book);
    }

    return {
        getMultipleVerses: _getMultipleVerses,
        getChapterVerses: _getChapterVerses,
        getBookMeta: _getBookMeta,
    };
}

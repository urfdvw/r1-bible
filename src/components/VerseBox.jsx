import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useContext } from "react";
import AppContext from "../AppContext";
import VerseRef from "../models/VerseRef";

const previewVerseBoxStyle = {
    border: "none",
    borderBottom: "1px solid #d9d9d9",
    borderRadius: 0,
    padding: 1,
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    cursor: "default",
};

export function PreviewVerseBox({ verseObj }) {
    const { getMultipleVerses, settings } = useContext(AppContext);
    const baseVerse = VerseRef.from(verseObj);
    const verses = getMultipleVerses(baseVerse);
    const textList =
        verses.length > 0
            ? verses[0].map((_, versionIndex) =>
                  verses
                      .map((versionVerse) => versionVerse[versionIndex]?.text || "")
                      .filter((text) => text.length > 0)
                      .join(" ")
              )
            : [];
    const isParallelContrastLayout = settings.language === "对照" && settings.contrast_layout === "并排";

    return (
        <Box sx={previewVerseBoxStyle}>
            <Typography sx={{ paddingRight: 1, flexShrink: 0 }}>{baseVerse.verse}</Typography>
            <Box
                sx={{
                    flexGrow: 1,
                    minWidth: 0,
                    display: isParallelContrastLayout ? "grid" : "flex",
                    flexDirection: isParallelContrastLayout ? undefined : "column",
                    gridTemplateColumns: isParallelContrastLayout
                        ? `repeat(${Math.max(textList.length, 1)}, minmax(0, 1fr))`
                        : undefined,
                    columnGap: isParallelContrastLayout ? 2 : undefined,
                    rowGap: 0.5,
                    alignItems: "start",
                }}
            >
                {textList.map((text, index) => (
                    <Typography key={index} sx={{ minWidth: 0, overflowWrap: "anywhere" }}>
                        {text}
                    </Typography>
                ))}
            </Box>
        </Box>
    );
}

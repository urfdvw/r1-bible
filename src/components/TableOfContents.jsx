import { abbreviations } from "../bible";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { useContext, useState } from "react";
import AppContext from "../AppContext";
import VerseRef from "../models/VerseRef";

const FourFixedColumns = ({ books, onClick }) => {
    return (
        <Grid
            container
            columns={4} // We explicitly define 4 total columns
            sx={{ width: "100%" }}
        >
            {books.map((book, index) => (
                // Each item occupies 1 out of the 4 columns
                <Grid item xs={1} key={index}>
                    <Box
                        onClick={() => onClick(book.index)}
                        sx={{
                            border: "1px solid #ccc",
                            borderRadius: "8px",
                            padding: 0,
                            textAlign: "center",
                            cursor: "pointer",
                            // Same width & height for each box (adjust as you like)
                            // height: 100,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                        }}
                    >
                        {/* First of pair: larger text */}
                        <Typography variant="h6" component="div">
                            {book.cn}
                        </Typography>
                        {/* Second of pair: smaller text */}
                        <Typography variant="body2" component="div">
                            {book.en}
                        </Typography>
                    </Box>
                </Grid>
            ))}
        </Grid>
    );
};
const FiveFixedColumns = ({ chapters, onClick }) => {
    return (
        <Grid
            container
            columns={5} // We explicitly define 5 total columns
            sx={{ width: "100%" }}
        >
            {chapters.map((chapter, index) => (
                // Each item occupies 1 out of the 5 columns
                <Grid item xs={1} key={index}>
                    <Box
                        onClick={() => {
                            onClick(chapter);
                        }}
                        sx={{
                            border: "1px solid #ccc",
                            borderRadius: "8px",
                            padding: 0,
                            textAlign: "center",
                            cursor: "pointer",
                            minHeight: "56px",
                            // Same width & height for each box (adjust as you like)
                            // height: 100,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                        }}
                    >
                        <Typography variant="body2" component="div">
                            {chapter}
                        </Typography>
                    </Box>
                </Grid>
            ))}
        </Grid>
    );
};

export default function TableOfContents() {
    const { appConfig, isMobileReadingMode, collapseLeftSidebar, getBookMeta, setPreviewVerse, setDisplayVerse } =
        useContext(AppContext);
    const [book, setBook] = useState(1);
    const [showChapters, setShowChapters] = useState(false);

    const chinese = appConfig.config.bible_display.chinese === "简体" ? "si" : "tr";
    const bookNameAbbreviations = [];
    for (var i = 1; i <= 66; i++) {
        bookNameAbbreviations.push({
            cn: abbreviations[i][chinese],
            en: abbreviations[i]["en"],
            index: i,
        });
    }
    const { chapters, bookName } = getBookMeta(book);

    function handleSelectBook(nextBook) {
        setBook(nextBook);
        setShowChapters(true);
    }

    function setChapter(chapter) {
        setPreviewVerse(new VerseRef({ book, chapter, verse: 1 }));
        if (isMobileReadingMode) {
            collapseLeftSidebar();
        } else if (appConfig.config.misc.menu_to_projector) {
            setDisplayVerse(new VerseRef({ book, chapter, verse: 1 }));
        }
    }

    return (
        <Box
            sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                overflowY: "scroll",
            }}
        >
            {showChapters ? (
                <Box
                    sx={{
                        flex: 1,
                        overflow: "auto",
                        p: 2,
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 2,
                        }}
                    >
                        <Typography variant="h6" component="div">
                            {bookName}
                        </Typography>
                        <Button
                            size="small"
                            onClick={() => {
                                setShowChapters(false);
                            }}
                        >
                            返回书卷
                        </Button>
                    </Box>
                    <FiveFixedColumns chapters={chapters} onClick={setChapter} />
                </Box>
            ) : (
                <Box
                    sx={{
                        flex: 1,
                        overflow: "auto",
                        p: 2,
                    }}
                >
                    <FourFixedColumns books={bookNameAbbreviations.slice(0, 38)} onClick={handleSelectBook} />
                    <br></br>
                    <FourFixedColumns books={bookNameAbbreviations.slice(39)} onClick={handleSelectBook} />
                </Box>
            )}
        </Box>
    );
}

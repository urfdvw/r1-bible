import { abbreviations } from "../bible";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { useContext, useState } from "react";
import AppContext from "../AppContext";
import VerseRef from "../models/VerseRef";

const bookTileStyle = {
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: 0,
    textAlign: "center",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
};

const chapterTileStyle = {
    ...bookTileStyle,
    minHeight: "56px",
};

const FourFixedColumns = ({ books, onClick }) => {
    return (
        <Grid container columns={4} sx={{ width: "100%" }}>
            {books.map((book) => (
                <Grid item xs={1} key={book.index}>
                    <Box onClick={() => onClick(book.index)} sx={bookTileStyle}>
                        <Typography variant="h6" component="div">
                            {book.cn}
                        </Typography>
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
        <Grid container columns={5} sx={{ width: "100%" }}>
            {chapters.map((chapter) => (
                <Grid item xs={1} key={chapter}>
                    <Box
                        onClick={() => {
                            onClick(chapter);
                        }}
                        sx={chapterTileStyle}
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
    const { settings, collapseBottomPanel, getBookMeta, setPreviewVerse } = useContext(AppContext);
    const [book, setBook] = useState(1);
    const [showChapters, setShowChapters] = useState(false);

    const chinese = settings.chinese === "简体" ? "si" : "tr";
    const bookNameAbbreviations = [];
    for (let i = 1; i <= 66; i += 1) {
        bookNameAbbreviations.push({
            cn: abbreviations[i][chinese],
            en: abbreviations[i].en,
            index: i,
        });
    }
    const { chapters, bookName } = getBookMeta(book);

    function handleSelectBook(nextBook) {
        setBook(nextBook);
        setShowChapters(true);
    }

    function handleSelectChapter(chapter) {
        setPreviewVerse(new VerseRef({ book, chapter, verse: 1 }));
        collapseBottomPanel();
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
                    <FiveFixedColumns chapters={chapters} onClick={handleSelectChapter} />
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
                    <FourFixedColumns books={bookNameAbbreviations.slice(38)} onClick={handleSelectBook} />
                </Box>
            )}
        </Box>
    );
}

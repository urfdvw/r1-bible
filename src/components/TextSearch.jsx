import { useContext, useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import AppContext from "../AppContext";
import { SearchVerseBox } from "./VerseBox";
import { searchVerses } from "../bible/utils";

const RESULTS_PER_PAGE = 10;

export default function TextSearch() {
    const { getSelectedVersions } = useContext(AppContext);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredResults, setFilteredResults] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [warning, setWarning] = useState("");

    const handleSearch = () => {
        const trimmedSearchTerm = searchTerm.trim();
        const isPureEnglish = /^[a-zA-Z]*$/.test(trimmedSearchTerm);

        if (trimmedSearchTerm.length === 0) {
            setWarning("请输入需要搜索的文字。");
            setFilteredResults([]);
            setCurrentPage(1);
            return;
        }

        if (isPureEnglish && trimmedSearchTerm.length < 2) {
            setWarning("如要搜索英文经文，请输入至少2个字母。");
            setFilteredResults([]);
            setCurrentPage(1);
            return;
        }

        setWarning("");
        setFilteredResults(searchVerses(getSelectedVersions(), trimmedSearchTerm));
        setCurrentPage(1);
    };

    const handleKeyDown = (event) => {
        if (event.key === "Enter") {
            handleSearch();
        }
    };

    const totalPages = Math.ceil(filteredResults.length / RESULTS_PER_PAGE);
    const indexOfLastResult = currentPage * RESULTS_PER_PAGE;
    const indexOfFirstResult = indexOfLastResult - RESULTS_PER_PAGE;
    const currentPageResults = filteredResults.slice(indexOfFirstResult, indexOfLastResult);
    const showPagination = totalPages > 1;

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage((prev) => prev - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage((prev) => prev + 1);
        }
    };

    return (
        <Box
            sx={{
                width: "100%",
                maxWidth: 600,
                margin: "0 auto",
                display: "flex",
                flexDirection: "column",
                height: "100%",
                minHeight: 0,
                p: 2,
                boxSizing: "border-box",
                gap: 2,
            }}
        >
            <Box display="flex" sx={{ flexShrink: 0, gap: 1 }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    value={searchTerm}
                    placeholder="输入经文中的文字"
                    onChange={(event) => setSearchTerm(event.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <Button variant="outlined" onClick={handleSearch}>
                    搜索
                </Button>
            </Box>
            <Box
                sx={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                }}
            >
                {warning ? (
                    <Typography color="error">{warning}</Typography>
                ) : (
                    currentPageResults.map((verse, index) => (
                        <SearchVerseBox
                            verseObj={verse}
                            keyWords={searchTerm.trim()}
                            key={`${verse.book}-${verse.chapter}-${verse.verse}-${index}`}
                        />
                    ))
                )}
                {!warning && filteredResults.length === 0 && (
                    <Typography color="text.secondary">输入关键字后可搜索当前选择版本的经文内容。</Typography>
                )}
            </Box>
            {showPagination && (
                <Box
                    sx={{
                        flexShrink: 0,
                        minHeight: 18,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 0.25,
                        color: "text.secondary",
                    }}
                >
                    <IconButton
                        // size="small"
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                        sx={{
                            p: 0.125,
                            color: "inherit",
                            "& .MuiSvgIcon-root": { fontSize: "0.95rem" },
                        }}
                    >
                        <ChevronLeftRoundedIcon />
                    </IconButton>
                    <Typography
                        variant="caption"
                        sx={{
                            minWidth: "5.5em",
                            textAlign: "center",
                            lineHeight: 1,
                            fontSize: "0.9rem",
                            letterSpacing: "0.04em",
                            fontVariantNumeric: "tabular-nums",
                            color: "inherit",
                        }}
                    >
                        {currentPage}/{totalPages}
                    </Typography>
                    <IconButton
                        // size="small"
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        sx={{
                            p: 0.125,
                            color: "inherit",
                            "& .MuiSvgIcon-root": { fontSize: "0.95rem" },
                        }}
                    >
                        <ChevronRightRoundedIcon />
                    </IconButton>
                </Box>
            )}
        </Box>
    );
}

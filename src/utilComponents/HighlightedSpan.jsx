function escapeRegExp(text) {
    return String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default function HighlightedSpan({ longString, shortString }) {
    if (!shortString) {
        return <span>{longString}</span>;
    }

    const normalizedLongString = String(longString ?? "");
    const normalizedShortString = String(shortString ?? "");
    const regex = new RegExp(`(${escapeRegExp(normalizedShortString)})`, "gi");
    const parts = normalizedLongString.split(regex);

    return (
        <span>
            {parts.map((part, index) =>
                part.toLowerCase() === normalizedShortString.toLowerCase() ? (
                    <span
                        key={index}
                        style={{
                            backgroundColor: "#ff9090",
                            fontWeight: "bold",
                        }}
                    >
                        {part}
                    </span>
                ) : (
                    <span key={index}>{part}</span>
                )
            )}
        </span>
    );
}

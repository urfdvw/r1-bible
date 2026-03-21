import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

export default function TabToolBar({ title = "", tools = [] }) {
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "space-between",
                borderBottom: "2px solid rgb(239,239,239)",
                width: "100%",
            }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "left",
                    flex: 1,
                }}
            >
                <Typography component="p" sx={{ marginLeft: "10pt" }}>
                    {title}
                </Typography>
            </div>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "left",
                }}
            >
                {tools.map((tool) => (
                    <Button onClick={tool.handler} key={tool.text}>
                        {tool.text}
                    </Button>
                ))}
            </div>
        </div>
    );
}

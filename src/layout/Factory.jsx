import UserConfigs from "../components/UserConfigs";
import Preview from "../components/Preview";
import TableOfContents from "../components/TableOfContents";

const fullSize = { height: "100%", width: "100%" };

const Factory = (node) => {
    const component = node.getComponent();
    if (component === "config") {
        return (
            <div className="tab_content" style={fullSize}>
                <UserConfigs />
            </div>
        );
    } else if (component === "preview") {
        return (
            <div className="tab_content" style={fullSize}>
                <Preview tabId={node.getId()} />
            </div>
        );
    } else if (component === "table_of_contents") {
        return (
            <div className="tab_content" style={fullSize}>
                <TableOfContents />
            </div>
        );
    }
    return null;
};

export default Factory;

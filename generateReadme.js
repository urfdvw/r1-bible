import { promises as fs } from "fs";
import path from "path";

const outputMarkdownPath = path.join(process.cwd(), "README.md");

const readmeContent = `# 阿丸圣经

为小屏设备整理的移动端圣经阅读应用。

## 当前功能

- 多个预览标签页，可并行查看不同书卷或章节
- 两步式圣经目录：先选书，再选章
- 单一设置页，集中调整语言、版本、排版和主题
- 支持简体、繁体、英文与中英对照

## 本地运行

\`\`\`bash
npm install
npm run dev
\`\`\`

## 构建

\`\`\`bash
npm run build
\`\`\`

## 开源协议

本项目基于 GPL 3.0 发布。
`;

async function generateMarkdown() {
    try {
        await fs.writeFile(outputMarkdownPath, readmeContent);
        console.log("Markdown file generated successfully!");
    } catch (err) {
        console.error("Failed to generate markdown file:", err);
        process.exitCode = 1;
    }
}

generateMarkdown();

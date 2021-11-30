import { Client } from "@notionhq/client"

export default function RecipePage({ recipes }) {
    return <pre>{JSON.stringify(recipes, null, 2)}</pre>
}

export async function getStaticProps() {
    const notion = new Client({
        auth: process.env.NOTION_SECRET
    })
    const data = await notion.blocks.children.list({
        block_id: process.env.PAGE_ID
    })
    return {
        props: {
            recipes: data
        }
    }
}

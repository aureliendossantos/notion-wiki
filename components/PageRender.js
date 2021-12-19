import TextRender from "./TextRender";

export default function PageRender(blocks) {
    return blocks.blocks.map(block => {
        switch (block.type) {
            case "heading_1":
                return <h2>{block.heading_1.text[0].plain_text}</h2>
            case "heading_2":
                return <h3>{block.heading_2.text[0].plain_text}</h3>
            case "heading_3":
                return <h4>{block.heading_3.text[0].plain_text}</h4>
            case "paragraph":
                return <p><TextRender text={block.paragraph.text} /></p>
            case "quote":
                return <blockquote><TextRender text={block.quote.text} /></blockquote>
            case "code":
                return <pre><TextRender text={block.code.text} /></pre>
            case "to_do":
                return <p><input type="checkbox" readOnly="readonly" />{block.to_do.text[0].plain_text}</p>
            case "image":
                return <figure>
                    {block.image.type == "external" ?
                        <a href={block.image.external.url} target="_blank" rel="noreferrer">
                            <img src={block.image.external.url} />
                        </a>
                    :
                        <a href={block.image.file.url} target="_blank" rel="noreferrer">
                            <img src={block.image.file.url} />
                        </a>
                    }
                    {block.image.caption[0] ? <figcaption><TextRender text={block.image.caption} /></figcaption> : null}
                </figure>
            case "bulleted_list_item":
                return <li><TextRender text={block.bulleted_list_item.text} /></li>
            case "table_of_contents":
                return <p className="error">Table of contents needed.</p>
            default:
                return <>
                    <p className="error">Bloc non supporté :</p>
                    <pre>{JSON.stringify(block, null, 2)}</pre>
                </>
        }
    })
}

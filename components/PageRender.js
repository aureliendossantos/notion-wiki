import TextRender from "./TextRender";

export default function PageRender(blocks) {
    let bulleted_list = []
    let numbered_list = []
    return blocks.blocks.map((block, index, blocks) => {
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
                bulleted_list.push(block.bulleted_list_item.text)
                if (blocks[index+1] && blocks[index+1].type == "bulleted_list_item") {
                    return null
                } else {
                    const toRender = bulleted_list
                    bulleted_list = []
                    return <ul>
                        {toRender.map((item, index) => <li key={index}><TextRender text={item} /></li>)}
                    </ul>
                }
            case "numbered_list_item":
                numbered_list.push(block.numbered_list_item.text)
                if (blocks[index+1] && blocks[index+1].type == "numbered_list_item") {
                    return null
                } else {
                    const toRender = numbered_list
                    numbered_list = []
                    return <ol>
                        {toRender.map((item, index) => <li key={index}><TextRender text={item} /></li>)}
                    </ol>
                }
            case "callout":
                return <p className="callout"><TextRender text={block.callout.text} /></p>
            case "link_preview":
                return <a className="link_preview" href={block.link_preview.url}><p>{block.link_preview.url}</p></a>
            case "bookmark":
                return <a className="link_preview" href={block.bookmark.url}><p>{block.bookmark.url}</p></a>
            case "table":
                return <table>
                    <tbody>
                        {block.children.map((row, row_index) => {
                            return <tr key={row.id}>
                                {row.table_row.cells.map((cell, cell_index) => {
                                    if ((row_index == 0 && block.table.has_column_header) || (cell_index == 0 && block.table.has_row_header)) {
                                        return <th><TextRender text={cell} /></th>
                                    } else {
                                        return <td><TextRender text={cell} /></td>
                                    }
                                })}
                            </tr>
                        })}
                    </tbody>
                </table>
            case "table_of_contents":
                return <p className="error">Table of contents needed.</p>
            case "unsupported":
                return <p className="error">{"Erreur : Bloc non supporté par l'API."}</p>
            default:
                return <>
                    <p className="error">Bloc non supporté :</p>
                    <pre>{JSON.stringify(block, null, 2)}</pre>
                </>
        }
    })
}

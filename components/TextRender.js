export default function TextRender(text) {
    return text.text.map(text => {
        switch (text.type) {
            case "text":
                let result = text.text.content
                if (text.text.link) {
                    result = <a href={text.text.link.url}>{result}</a>
                }
                if (text.annotations.bold) {
                    result = <strong>{result}</strong>
                }
                if (text.annotations.italic) {
                    result = <em>{result}</em>
                }
                if (text.annotations.code) {
                    result = <code>{result}</code>
                }
                return result
            case "mention":
                return <pre>{JSON.stringify(text, null, 2)}</pre>
            case "equation":
                return <pre>{JSON.stringify(text, null, 2)}</pre>
        }
    })
}

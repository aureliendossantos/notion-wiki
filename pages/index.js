
export default function Home({ quote }) {
  return <p>{JSON.stringify(quote)}</p>
}

export async function getStaticProps() {
  const quote = await fetch('https://breaking-bad-quotes.herokuapp.com/v1/quotes')
  .then(resp => resp.json());

  return {
    props: {
      quote
    }
  }
}

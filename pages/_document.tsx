import Document, { Head, Html, Main, NextScript } from "next/document";

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
        <Head>
          <link rel="icon" href="/favicon.ico" />
          <meta
            name="description"
            content="Get song recommendations based on your mood."
          />
          <meta property="og:site_name" content="twitterbio.com" />
          <meta
            property="og:description"
            content="Get song recommendations based on your mood."
          />
          <meta property="og:title" content="yourMelody - AI Based Song Recommendation Engine" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="yourMelody - AI Based Song Recommendation Engine" />
          <meta
            name="twitter:description"
            content="Get song recommendations based on your mood."
          />
          
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;

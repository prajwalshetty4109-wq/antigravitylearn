import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@600;700&display=swap"
          rel="stylesheet"
        />
        <meta name="theme-color" content="#7C3AED" />
      </Head>
      <body className="bg-[#FAF9FF] text-slate-900 font-sans antialiased min-h-screen">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

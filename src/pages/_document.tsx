// pages/_document.tsx

import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html>
      <Head>
        <meta name="viewport" content="width=1024" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

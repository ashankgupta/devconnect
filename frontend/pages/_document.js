import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Tailwind CSS CDN */}
        <script src="https://cdn.tailwindcss.com"></script>
        {/* Google Sign-In */}
        <script src="https://apis.google.com/js/platform.js" async defer></script>
        <meta name="google-signin-client_id" content={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""} />
        {/* Custom Tailwind config */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              tailwind.config = {
                theme: {
                  extend: {
                    colors: {
                      primary: {
                        50: '#eff6ff',
                        500: '#3b82f6',
                        600: '#2563eb',
                        700: '#1d4ed8',
                      },
                    },
                  },
                },
              }
            `,
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>MediFlow 3D | AI-Powered Hospital Live Queue & Triage</title>
        <meta
          name="description"
          content="MediFlow 3D is an AI-powered hospital live queue, smart triage, and wait-time predictor built with Gemini 2.5 Flash and Supabase Realtime."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🏥</text></svg>" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

import type { AppProps } from 'next/app';

export default function IQRAApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

import { redirect } from "next/navigation";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function Home({ searchParams }: Props) {
  const params = await searchParams;

  // LIFF経由のアクセス: liff.state に元のパスが入っているのでそちらへリダイレクト
  const liffState = params["liff.state"];
  if (typeof liffState === "string" && liffState.startsWith("/")) {
    redirect(liffState);
  }

  const queryString = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    const values = Array.isArray(value) ? value : [value];
    values.forEach(v => queryString.append(key, v));
  }

  const query = queryString.toString();
  redirect(`/map${query ? `?${query}` : ""}`);
}

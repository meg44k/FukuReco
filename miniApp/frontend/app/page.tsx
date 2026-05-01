import { redirect } from "next/navigation";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function Home({ searchParams }: Props) {
  const params = await searchParams;
  const queryString = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    const values = Array.isArray(value) ? value : [value];
    values.forEach(v => queryString.append(key, v));
  }

  const query = queryString.toString();
  redirect(`/map${query ? `?${query}` : ""}`);
}

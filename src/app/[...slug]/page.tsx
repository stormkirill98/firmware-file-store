import fs from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';

export const dynamic = 'force-static';

const CONTENT_ROOT = path.join(process.cwd(), 'content');

function walk(dir: string, parts: string[] = []): string[][] {
  const result: string[][] = [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const newParts = [...parts, entry.name];

    if (entry.isDirectory()) {
      result.push(...walk(fullPath, newParts));
    } else if (entry.name === 'information.md') {
      result.push(parts); // папка, в которой лежит information.md
    }
  }

  return result;
}

export async function generateStaticParams() {
  const slugs = walk(CONTENT_ROOT);
  return slugs.map((slug) => ({ slug }));
}

type Props = {
  params: Promise<{ slug?: string[] }>;
};

export default async function Page({ params }: Props) {
  const awaitedParams = await params;

  const slugPath = awaitedParams.slug?.join('/') || '';
  const infoPath = path.join(CONTENT_ROOT, slugPath, 'information.json');

  if (!fs.existsSync(infoPath)) return notFound();

  const fileContent = fs.readFileSync(infoPath, 'utf-8');
  let parsed: { description?: string };

  try {
    parsed = JSON.parse(fileContent);
  } catch (error) {
    return <p>Ошибка при чтении JSON {error.message}</p>;
  }

  if (!parsed.description) return <p>Нет описания</p>;

  return (
    <main className="max-w-2xl m-auto p-8 text-lg text-white">
      <h1 className="text-2xl font-bold mb-4">Описание</h1>
      <p>{parsed.description}</p>
    </main>
  );
}


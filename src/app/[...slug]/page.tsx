import fs from 'fs';
import path from 'path';
import Link from 'next/link';

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
    } else {
      result.push(newParts);
    }
  }

  return result;
}

export async function generateStaticParams() {
  const slugs = walk(CONTENT_ROOT);
  return slugs.map((slug) => ({ slug }));
}

interface FolderProps {
  dirPath: string; // относительный путь, например: 'content'
}
function FolderLinks({ dirPath }: FolderProps) {
  const infoPath = path.join(CONTENT_ROOT, dirPath);
  if (!fs.existsSync(infoPath) || !fs.lstatSync(infoPath).isDirectory()) {
    return null;
  }

  // Получаем содержимое директории
  const entries = fs.readdirSync(infoPath, { withFileTypes: true });

  return (
    <ul>
      {entries.map(folder => (
        <li key={folder.name}>
          <Link href={`/${dirPath}/${folder.name}`}>
            {folder.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}

type Props = {
  params: Promise<{ slug?: string[] }>;
};

export default async function Page({ params }: Props) {
  const awaitedParams = await params;
  const slugPath = awaitedParams.slug?.join('/') || '';

  return <main className="max-w-2xl m-auto p-8 text-lg">
    <h1>File</h1>
    <p>{slugPath}</p>

    <FolderLinks dirPath={slugPath} />
  </main>
}


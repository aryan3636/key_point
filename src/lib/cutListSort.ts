import { CutListRecord } from "@/lib/inventoryMock";

function splitCode(value: string) {
  const match = value.trim().match(/^([a-zA-Z]+)?(\d+)?(.*)$/);
  return {
    prefix: (match?.[1] ?? "").toLowerCase(),
    number: match?.[2] ? Number(match[2]) : Number.POSITIVE_INFINITY,
    suffix: (match?.[3] ?? "").toLowerCase(),
    raw: value.toLowerCase(),
  };
}

export function sortCutListsByCode(cutLists: CutListRecord[]) {
  return [...cutLists].sort((a, b) => {
    const left = splitCode(a.code);
    const right = splitCode(b.code);

    if (left.prefix !== right.prefix) {
      return left.prefix.localeCompare(right.prefix);
    }
    if (left.number !== right.number) {
      return left.number - right.number;
    }
    if (left.suffix !== right.suffix) {
      return left.suffix.localeCompare(right.suffix);
    }
    return left.raw.localeCompare(right.raw);
  });
}

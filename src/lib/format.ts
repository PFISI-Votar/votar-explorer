import { formatEther } from "viem";

export function shortHash(value: string, start = 10, end = 7) {
  if (value.length <= start + end + 1) return value;
  return `${value.slice(0, start)}…${value.slice(-end)}`;
}

export function formatEth(value: bigint) {
  const amount = Number(formatEther(value));
  return `${amount.toLocaleString("es-AR", { maximumFractionDigits: 6 })} ETH`;
}

export function formatNumber(value: bigint | number) {
  return Number(value).toLocaleString("es-AR");
}

export function formatTimestamp(seconds: bigint) {
  return new Intl.DateTimeFormat("es-AR", { dateStyle: "medium", timeStyle: "medium", timeZone: "America/Argentina/Cordoba" }).format(new Date(Number(seconds) * 1000));
}

export function relativeTime(seconds: bigint) {
  const delta = Math.max(0, Math.floor(Date.now() / 1000) - Number(seconds));
  if (delta < 60) return `hace ${delta} s`;
  if (delta < 3600) return `hace ${Math.floor(delta / 60)} min`;
  if (delta < 86400) return `hace ${Math.floor(delta / 3600)} h`;
  return `hace ${Math.floor(delta / 86400)} d`;
}

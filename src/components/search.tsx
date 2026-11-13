export function Search() {
  return (
    <form className="search" action="/search" role="search">
      <input aria-label="Buscar por bloque, transacción o dirección" name="q" placeholder="Bloque, hash de transacción o dirección 0x…" required autoComplete="off" />
      <button type="submit">Buscar</button>
    </form>
  );
}

# Seguridad

## Reportar una vulnerabilidad

No publiques detalles sensibles en un issue. Reportalos de forma privada a los mantenedores del proyecto y adjuntá impacto, pasos de reproducción y una mitigación sugerida. No incluyas claves, tokens ni datos personales reales.

## Modelo operativo

- El nodo Hardhat escucha exclusivamente en `127.0.0.1:8545`.
- Cloudflare Tunnel publica el gateway de `127.0.0.1:8546`, nunca Hardhat directamente.
- El hostname público termina en un gateway de solo lectura.
- Cloudflare Access exige un Service Token para el hostname privado; las credenciales viven solo en Vercel.
- Solo el gateway privado admite `eth_sendRawTransaction`; ambos bloquean namespaces administrativos y `eth_sendTransaction`.
- La verificación exige `VERIFY_API_TOKEN`, limita la entrada y usa un compilador fijado.
- Las claves privadas no pertenecen a este repositorio ni al nodo RPC. El backend firma fuera del RPC o envía transacciones ya firmadas.

Rotá de inmediato cualquier credencial expuesta y revocá el Service Token de Cloudflare antes de reemplazarlo.

## Configuración Cloudflare

- `rpc11.probit.com.ar` → `http://127.0.0.1:8546` (sin Access, lecturas públicas).
- `rpc-admin11.probit.com.ar` → `http://127.0.0.1:8547` (Access obligatorio).
- La aplicación Access privada usa una política `Service Auth` que incluye
  únicamente el Service Token de `votar-back`.
- El hostname público debe tener rate limiting por IP. CORS reduce abuso desde
  navegadores, pero no reemplaza autenticación ni rate limiting.
- Los puertos 8545, 8546 y 8547 permanecen cerrados en LAN/WAN; `cloudflared`
  es el único proceso que llega a los gateways por loopback.

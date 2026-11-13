# Seguridad

## Reportar una vulnerabilidad

No publiques detalles sensibles en un issue. Reportalos de forma privada a los mantenedores del proyecto y adjuntá impacto, pasos de reproducción y una mitigación sugerida. No incluyas claves, tokens ni datos personales reales.

## Modelo operativo

- El nodo Hardhat escucha exclusivamente en `127.0.0.1:8545`.
- Cloudflare Tunnel publica el gateway de `127.0.0.1:8546`, nunca Hardhat directamente.
- Cloudflare Access exige un Service Token; las credenciales viven solo en Vercel.
- El gateway admite lecturas y `eth_sendRawTransaction`, pero bloquea namespaces administrativos y `eth_sendTransaction`.
- La verificación exige `VERIFY_API_TOKEN`, limita la entrada y usa un compilador fijado.
- Las claves privadas no pertenecen a este repositorio ni al nodo RPC. El backend firma fuera del RPC o envía transacciones ya firmadas.

Rotá de inmediato cualquier credencial expuesta y revocá el Service Token de Cloudflare antes de reemplazarlo.

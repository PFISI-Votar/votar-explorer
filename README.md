# VOTAR Explorer

Explorador de bloques privado para el nodo Hardhat del simulacro electoral. La interfaz ofrece bloques, transacciones, direcciones, contratos y verificación reproducible de código fuente. Está preparada para desplegarse en Vercel y conectarse al nodo mediante Cloudflare Tunnel + Access.

## Arquitectura

```text
Vercel (explorer + backend)
  │  HTTPS + CF Access Service Token
  ▼
Cloudflare Access / Tunnel
  ▼
127.0.0.1:8546  RPC gateway con allowlist
  ▼
127.0.0.1:8545  Hardhat node
```

El navegador nunca recibe la URL ni las credenciales RPC. Las consultas salen desde Route Handlers y Server Components de Next.js. El gateway permite `eth_sendRawTransaction`, pero bloquea métodos administrativos de Hardhat, EVM, cuentas personales y firma con cuentas desbloqueadas.

## Desarrollo local

Requisitos: Node.js 22, npm y un nodo JSON-RPC local.

```bash
cp .env.example .env.local
npm ci --legacy-peer-deps
npm run dev
```

Configuración mínima:

```dotenv
RPC_URL=http://127.0.0.1:8545
CHAIN_ID=31337
NETWORK_NAME=VOTAR Local
```

Comandos de calidad:

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run audit:prod
```

## Contratos y verificación

La lista de contratos contiene los que hayan sido verificados; una cadena EVM no mantiene un índice nativo de todas las creaciones. Para habilitarla:

1. Creá una base PostgreSQL y definí `DATABASE_URL`.
2. Ejecutá `npm run db:migrate` desde una máquina con `psql`.
3. Generá un token aleatorio de al menos 32 bytes para `VERIFY_API_TOKEN`.
4. En `/verify`, cargá la dirección y el archivo correspondiente de `artifacts/build-info/*.json` del repo blockchain.

El servidor recompila las fuentes con Solidity 0.8.26 y compara el bytecode completo obtenido desde `eth_getCode`. Las posiciones de librerías vinculadas e inmutables se comparan según las referencias del compilador. Solo después de una coincidencia se publican las fuentes y el ABI.

## Nodo y Cloudflare Tunnel

1. Ejecutá Hardhat ligado solo a loopback: `npx hardhat node --hostname 127.0.0.1`.
2. Copiá este repo a `/opt/votar-explorer` en el host y creá un usuario de sistema `votar` sin login.
3. Instalá `infra/votar-rpc-gateway.service`, ajustá rutas/usuario si corresponde, y habilitalo.
4. Copiá `infra/cloudflared.example.yml` a `/etc/cloudflared/config.yml`, reemplazá UUID y hostname, y validá con `cloudflared tunnel ingress validate`.
5. En Cloudflare Zero Trust creá una aplicación Access para el hostname RPC y una política **Service Auth** que acepte únicamente un Service Token dedicado.
6. Guardá `RPC_URL`, `CF_ACCESS_CLIENT_ID` y `CF_ACCESS_CLIENT_SECRET` como variables cifradas del explorer y del backend en Vercel.
7. Aplicá rate limiting en Cloudflare al hostname RPC y no abras los puertos 8545/8546 en el firewall.

Probá primero el gateway local:

```bash
curl -sS http://127.0.0.1:8546 \
  -H 'content-type: application/json' \
  --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
```

Luego repetí contra el hostname con `CF-Access-Client-Id` y `CF-Access-Client-Secret`. La documentación oficial relevante es [Cloudflare Tunnel](https://developers.cloudflare.com/tunnel/) y [parámetros de origen](https://developers.cloudflare.com/tunnel/reference/origin-parameters/).

## Vercel

Importá el repositorio como proyecto Next.js y configurá todas las variables de `.env.example` en Production y Preview según corresponda. No uses variables `NEXT_PUBLIC_` para secretos. La migración SQL se ejecuta fuera del build para evitar que cada despliegue compita por el esquema.

## Limitaciones deliberadas

- El inicio recorre pocos bloques recientes en vivo; no pretende reemplazar un indexador histórico.
- La página de contratos enumera contratos verificados, no todos los contratos creados.
- Hardhat no es una red durable: si se reinicia sin estado persistido, cambian bloques y despliegues. Para el simulacro, respaldá el estado o automatizá redeploy + reverificación.

Consultá [SECURITY.md](SECURITY.md) antes de publicar el túnel.

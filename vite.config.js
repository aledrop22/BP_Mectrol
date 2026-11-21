import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { spawn } from 'node:child_process'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'

const csvPath = path.resolve(process.cwd(), 'local_data', 'historico_bps_desenho.csv')
const jsonPath = path.resolve(process.cwd(), 'local_data', 'historico_bps_desenho.json')
const credentialScript = path.resolve(process.cwd(), 'scripts', 'credential_manager.ps1')
const maxCsvBytes = 5 * 1024 * 1024

function localBpCsv() {
  return {
    name: 'local-bp-csv',
    configureServer(server) {
      server.middlewares.use('/local-data/historico_bps_desenho.csv', async (req, res, next) => {
        if (req.method === 'OPTIONS') {
          res.setHeader('Access-Control-Allow-Origin', 'https://bp.mectrol.com.br')
          res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
          res.setHeader('Vary', 'Origin')
          res.statusCode = 204
          res.end()
          return
        }

        if (req.method === 'GET') {
          try {
            const csv = await readFile(csvPath)
            res.setHeader('Content-Type', 'text/csv; charset=utf-8')
            res.setHeader('Cache-Control', 'no-store')
            res.end(csv)
          } catch (error) {
            if (error.code === 'ENOENT') {
              res.statusCode = 404
              res.end('CSV local ainda não foi sincronizado.')
              return
            }
            next(error)
          }
          return
        }

        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end('Método não permitido.')
          return
        }

        if (req.headers.origin !== 'https://bp.mectrol.com.br') {
          res.statusCode = 403
          res.end('Origem não autorizada.')
          return
        }

        let bytes = 0
        const chunks = []
        try {
          for await (const chunk of req) {
            bytes += chunk.length
            if (bytes > maxCsvBytes) {
              res.statusCode = 413
              res.end('CSV excede o limite permitido.')
              return
            }
            chunks.push(chunk)
          }

          const csv = Buffer.concat(chunks).toString('utf8')
          if (!/^\uFEFF?"?BP"?,/.test(csv) || !csv.includes('\n')) {
            res.statusCode = 400
            res.end('Formato CSV inválido.')
            return
          }

          await mkdir(path.dirname(csvPath), { recursive: true })
          const tempPath = `${csvPath}.${process.pid}.tmp`
          await writeFile(tempPath, csv, 'utf8')
          await rename(tempPath, csvPath)
          res.setHeader('Access-Control-Allow-Origin', 'https://bp.mectrol.com.br')
          res.setHeader('Vary', 'Origin')
          res.statusCode = 204
          res.end()
        } catch (error) {
          next(error)
        }
      })

      server.middlewares.use('/api/bps', async (req, res, next) => {
        if (req.method !== 'GET') {
          res.statusCode = 405
          res.end('Método não permitido.')
          return
        }

        try {
          const json = await readFile(jsonPath)
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.setHeader('Cache-Control', 'no-store')
          res.end(json)
        } catch (error) {
          if (error.code === 'ENOENT') {
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.statusCode = 404
            res.end(JSON.stringify({ error: 'data_not_synced' }))
            return
          }
          next(error)
        }
      })

      server.middlewares.use('/local-data/portal-token', async (req, res, next) => {
        const origin = req.headers.origin
        if (req.method === 'OPTIONS') {
          if (origin !== 'https://bp.mectrol.com.br') {
            res.statusCode = 403
            res.end('Origem não autorizada.')
            return
          }
          res.setHeader('Access-Control-Allow-Origin', origin)
          res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
          res.setHeader('Vary', 'Origin')
          res.statusCode = 204
          res.end()
          return
        }

        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end('Método não permitido.')
          return
        }
        if (origin !== 'https://bp.mectrol.com.br') {
          res.statusCode = 403
          res.end('Origem não autorizada.')
          return
        }

        let bytes = 0
        const chunks = []
        try {
          for await (const chunk of req) {
            bytes += chunk.length
            if (bytes > 2048) {
              res.statusCode = 413
              res.end('Token excede o limite permitido.')
              return
            }
            chunks.push(chunk)
          }

          const token = Buffer.concat(chunks).toString('utf8').trim()
          if (!/^[A-Za-z0-9._-]{20,512}$/.test(token)) {
            res.statusCode = 400
            res.end('Token inválido.')
            return
          }

          const child = spawn(
            'powershell.exe',
            ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', credentialScript, '-Mode', 'Store'],
            { windowsHide: true }
          )
          let stderr = ''
          child.stderr.on('data', (chunk) => {
            stderr += chunk.toString()
          })
          child.stdin.end(token)
          child.on('error', next)
          child.on('close', (code) => {
            if (code !== 0) {
              res.statusCode = 500
              res.end('Não foi possível guardar a sessão no Windows Credential Manager.')
              server.config.logger.error(`Credential Manager falhou: ${stderr.trim()}`)
              return
            }
            res.setHeader('Access-Control-Allow-Origin', origin)
            res.setHeader('Cache-Control', 'no-store')
            res.setHeader('Vary', 'Origin')
            res.statusCode = 204
            res.end()
          })
        } catch (error) {
          next(error)
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), localBpCsv()],
  server: {
    port: 3000,
    host: '127.0.0.1',
  },
})

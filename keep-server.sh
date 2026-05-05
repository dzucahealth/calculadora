#!/bin/bash
cd /home/z/my-project
while true; do
  echo "[$(date)] Iniciando servidor..."
  bun run dev >> /home/z/my-project/server.log 2>&1
  echo "[$(date)] Servidor caiu. Reiniciando em 3s..."
  sleep 3
done

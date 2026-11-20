$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$localData = Join-Path $root 'local_data'
$logPath = Join-Path $localData 'portal-sync.log'

New-Item -ItemType Directory -Force -Path $localData | Out-Null
Set-Location $root
& node.exe (Join-Path $PSScriptRoot 'sync_portal_api.js') *>> $logPath
exit $LASTEXITCODE

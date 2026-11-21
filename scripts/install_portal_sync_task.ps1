$ErrorActionPreference = 'Stop'

$taskName = 'Mectrol BP dashboard sync'
$runner = Join-Path $PSScriptRoot 'run_portal_sync.ps1'
$taskAction = "powershell.exe -WindowStyle Hidden -NoProfile -ExecutionPolicy Bypass -File `"$runner`""

& schtasks.exe /Create /TN $taskName /SC MINUTE /MO 5 /TR $taskAction /F /IT | Out-Null
if ($LASTEXITCODE -ne 0) {
  throw "Não foi possível criar a tarefa agendada (código $LASTEXITCODE)."
}

& schtasks.exe /Query /TN $taskName /V /FO LIST
if ($LASTEXITCODE -ne 0) {
  throw 'A tarefa foi criada, mas não pôde ser verificada.'
}

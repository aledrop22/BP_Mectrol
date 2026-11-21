$ErrorActionPreference = 'Stop'

$secureSecret = Read-Host 'Cole o valor de BP_SYNC_SECRET configurado no Vercel' -AsSecureString
$pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureSecret)
try {
  $secret = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
  $helperOutput = @($secret | & powershell.exe `
    -NoProfile `
    -ExecutionPolicy Bypass `
    -File (Join-Path $PSScriptRoot 'credential_manager.ps1') `
    -Mode StoreVercel 2>&1)
  $helperExitCode = $LASTEXITCODE
  if ($helperExitCode -ne 0) {
    $detail = ($helperOutput | ForEach-Object { $_.ToString() }) -join ' '
    throw "Não foi possível guardar BP_SYNC_SECRET no Windows Credential Manager. $detail"
  }
  Write-Output 'BP_SYNC_SECRET armazenado no Windows Credential Manager.'
} finally {
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
  Remove-Variable secret -ErrorAction SilentlyContinue
}

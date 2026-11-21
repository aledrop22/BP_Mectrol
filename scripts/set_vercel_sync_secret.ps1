$ErrorActionPreference = 'Stop'

$secureSecret = Read-Host 'Cole o valor de BP_SYNC_SECRET configurado no Vercel' -AsSecureString
$pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureSecret)
try {
  $secret = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
  $secret | & powershell.exe `
    -NoProfile `
    -ExecutionPolicy Bypass `
    -File (Join-Path $PSScriptRoot 'credential_manager.ps1') `
    -Mode StoreVercel | Out-Null
  if ($LASTEXITCODE -ne 0) {
    throw 'Não foi possível guardar BP_SYNC_SECRET no Windows Credential Manager.'
  }
  Write-Output 'BP_SYNC_SECRET armazenado no Windows Credential Manager.'
} finally {
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
  Remove-Variable secret -ErrorAction SilentlyContinue
}

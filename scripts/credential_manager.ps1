param(
  [Parameter(Mandatory = $true)]
  [ValidateSet('Store', 'Read', 'StoreVercel', 'ReadVercel')]
  [string]$Mode
)

$ErrorActionPreference = 'Stop'

Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;

namespace BpLocal {
    public static class CredentialStore {
        [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
        public struct Credential {
            public UInt32 Flags;
            public UInt32 Type;
            [MarshalAs(UnmanagedType.LPWStr)] public String TargetName;
            [MarshalAs(UnmanagedType.LPWStr)] public String Comment;
            public Int64 LastWritten;
            public UInt32 CredentialBlobSize;
            public IntPtr CredentialBlob;
            public UInt32 Persist;
            public UInt32 AttributeCount;
            public IntPtr Attributes;
            [MarshalAs(UnmanagedType.LPWStr)] public String TargetAlias;
            [MarshalAs(UnmanagedType.LPWStr)] public String UserName;
        }

        [DllImport("advapi32.dll", EntryPoint = "CredWriteW", CharSet = CharSet.Unicode, SetLastError = true)]
        public static extern Boolean CredWrite(ref Credential credential, UInt32 flags);

        [DllImport("advapi32.dll", EntryPoint = "CredReadW", CharSet = CharSet.Unicode, SetLastError = true)]
        public static extern Boolean CredRead(String target, UInt32 type, UInt32 flags, out IntPtr credential);

        [DllImport("advapi32.dll", EntryPoint = "CredFree", SetLastError = false)]
        public static extern void CredFree(IntPtr credential);
    }
}
"@

$isVercel = $Mode.EndsWith('Vercel')
$target = if ($isVercel) { 'BP_MECTROL_VERCEL_SYNC_SECRET' } else { 'BP_MECTROL_PORTAL_SESSION' }
$isStore = $Mode.StartsWith('Store')

if ($isStore) {
  [Console]::InputEncoding = New-Object System.Text.UTF8Encoding($false)
  $token = [Console]::In.ReadToEnd().Trim()
  $minimumLength = if ($isVercel) { 32 } else { 20 }
  if ($token -notmatch "^[A-Za-z0-9._-]{$minimumLength,512}$") {
    throw 'Segredo fornecido inválido.'
  }

  $bytes = [System.Text.Encoding]::Unicode.GetBytes($token)
  $handle = [Runtime.InteropServices.GCHandle]::Alloc(
    $bytes,
    [Runtime.InteropServices.GCHandleType]::Pinned
  )
  try {
    $credential = New-Object BpLocal.CredentialStore+Credential
    $credential.Type = 1
    $credential.TargetName = $target
    $credential.Comment = if ($isVercel) {
      'Segredo local para publicação privada no Vercel'
    } else {
      'Token local de sincronização do portal MECTROL'
    }
    $credential.CredentialBlobSize = [uint32]$bytes.Length
    $credential.CredentialBlob = $handle.AddrOfPinnedObject()
    $credential.Persist = 2
    $credential.UserName = if ($isVercel) { 'vercel-sync' } else { 'portal-session' }
    if (-not [BpLocal.CredentialStore]::CredWrite([ref]$credential, 0)) {
      throw [ComponentModel.Win32Exception]::new(
        [Runtime.InteropServices.Marshal]::GetLastWin32Error()
      )
    }
  } finally {
    $handle.Free()
  }
  [Console]::Out.Write('stored')
  exit 0
}

$pointer = [IntPtr]::Zero
if (-not [BpLocal.CredentialStore]::CredRead($target, 1, 0, [ref]$pointer)) {
  if ($Mode -eq 'ReadVercel') {
    exit 0
  }
  throw 'Token de sessão não encontrado no Windows Credential Manager.'
}

try {
  $credential = [Runtime.InteropServices.Marshal]::PtrToStructure(
    $pointer,
    [type]'BpLocal.CredentialStore+Credential'
  )
  $token = [Runtime.InteropServices.Marshal]::PtrToStringUni(
    $credential.CredentialBlob,
    [int]($credential.CredentialBlobSize / 2)
  )
  if (-not $token -and $Mode -ne 'ReadVercel') {
    throw 'Token de sessão vazio no Windows Credential Manager.'
  }
  [Console]::Out.Write($token)
} finally {
  [BpLocal.CredentialStore]::CredFree($pointer)
}

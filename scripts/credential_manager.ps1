param(
  [Parameter(Mandatory = $true)]
  [ValidateSet('Store', 'Read')]
  [string]$Mode,

  [string]$Target = 'BP_MECTROL_PORTAL_SESSION'
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

$isStore = $Mode.StartsWith('Store')

if ($isStore) {
  [Console]::InputEncoding = New-Object System.Text.UTF8Encoding($false)
  $rawValue = [Console]::In.ReadToEnd()
  $token = if ($Target -eq 'BP_MECTROL_PORTAL_SESSION') {
    $rawValue.Trim()
  } else {
    $rawValue.TrimEnd("`r", "`n")
  }
  if ($Target -eq 'BP_MECTROL_PORTAL_SESSION') {
    if ($token -notmatch '^[A-Za-z0-9._-]{20,512}$') {
      throw 'Token de sessão inválido: use 20 a 512 caracteres ASCII, sem espaços.'
    }
  } elseif ($token.Length -lt 1 -or $token.Length -gt 200 -or $token -match "[\r\n]") {
    throw 'Credencial inválida: use de 1 a 200 caracteres, sem quebras de linha.'
  }

  $bytes = [System.Text.Encoding]::Unicode.GetBytes($token)
  $handle = [Runtime.InteropServices.GCHandle]::Alloc(
    $bytes,
    [Runtime.InteropServices.GCHandleType]::Pinned
  )
  try {
    $credential = New-Object BpLocal.CredentialStore+Credential
    $credential.Type = 1
    $credential.TargetName = $Target
    $credential.Comment = "Credencial local do portal MECTROL ($Target)"
    $credential.CredentialBlobSize = [uint32]$bytes.Length
    $credential.CredentialBlob = $handle.AddrOfPinnedObject()
    $credential.Persist = 2
    $credential.UserName = 'portal-sync'
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
if (-not [BpLocal.CredentialStore]::CredRead($Target, 1, 0, [ref]$pointer)) {
  throw "Credencial $Target não encontrada no Windows Credential Manager."
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
  if (-not $token) {
    throw "Credencial $Target vazia no Windows Credential Manager."
  }
  [Console]::Out.Write($token)
} finally {
  [BpLocal.CredentialStore]::CredFree($pointer)
}

# Elevated bootstrap - ALWAYS writes forcekeys_boot.log so a crash is still readable.
$ErrorActionPreference = "Continue"
$root = "C:\Games\Diablo II\ProjectD2-Realm\d2bot_3rd_try"
$log = Join-Path $root "forcekeys_boot.log"
$srcExe = "C:\Games\Diablo II\ProjectD2-Realm\d2bot_3rd_try_stacklab\d2bs-proxy\Pd2ForceKeysHelper.exe"
$srcDll = "C:\Games\Diablo II\ProjectD2-Realm\d2bot_3rd_try_stacklab\d2bs-proxy\Pd2ForceKeysHook.dll"
$dstExe = "C:\Games\Diablo II\ProjectD2-Realm\d2bot_3rd_try\d2bs\Pd2ForceKeysHelper.exe"
$dstDll = "C:\Games\Diablo II\ProjectD2-Realm\d2bot_3rd_try\d2bs\Pd2ForceKeysHook.dll"
$data = "C:\Games\Diablo II\ProjectD2-Realm\d2bot_3rd_try\d2bs\kolbot\data"
$d2bs = "C:\Games\Diablo II\ProjectD2-Realm\d2bot_3rd_try\d2bs"

function Out {
	param([string]$msg)
	$ts = Get-Date -Format "HH:mm:ss"
	$line = "[$ts] $msg"
	Write-Host $line
	Add-Content -LiteralPath $log -Value $line -Encoding ASCII
}

Set-Content -LiteralPath $log -Value "" -Encoding ASCII

Out "=== StartForceKeys elevated bootstrap ==="

try {
	$id = [Security.Principal.WindowsIdentity]::GetCurrent()
	Out ("whoami=" + $id.Name)
	$principal = New-Object Security.Principal.WindowsPrincipal($id)
	$admin = $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
	Out ("elevated=" + $admin)

	Out "Killing Pd2ForceKeysHelper..."
	Get-Process Pd2ForceKeysHelper -ErrorAction SilentlyContinue | ForEach-Object {
		Out ("kill pid=" + $_.Id)
		Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
	}
	Start-Sleep -Seconds 2
	Get-Process Pd2ForceKeysHelper -ErrorAction SilentlyContinue | ForEach-Object {
		Out ("kill-retry pid=" + $_.Id)
		Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
	}
	Start-Sleep -Seconds 1

	$left = @(Get-Process Pd2ForceKeysHelper -ErrorAction SilentlyContinue)
	if ($left.Count -gt 0) {
		$pids = ($left | ForEach-Object { $_.Id }) -join ","
		Out ("ERROR still locked pids=" + $pids)
		Out "Close them in Admin Task Manager, then re-run."
		Read-Host "Press Enter"
		exit 1
	}
	Out "helpers cleared"

	if (-not (Test-Path -LiteralPath $srcExe)) {
		Out ("ERROR missing build: " + $srcExe)
		Read-Host "Press Enter"
		exit 1
	}

	Copy-Item -LiteralPath $srcExe -Destination $dstExe -Force
	$info = Get-Item -LiteralPath $dstExe
	Out ("Installed helper bytes=" + $info.Length + " time=" + $info.LastWriteTime)

	if (Test-Path -LiteralPath $srcDll) {
		$staged = Join-Path (Split-Path $dstDll) "Pd2ForceKeysHook_new.dll"
		try {
			Copy-Item -LiteralPath $srcDll -Destination $dstDll -Force
			Out ("Installed hook dll bytes=" + (Get-Item $dstDll).Length + " time=" + (Get-Item $dstDll).LastWriteTime)
			Remove-Item -LiteralPath $staged -Force -ErrorAction SilentlyContinue
		} catch {
			# Game has the DLL mapped - still start helper; inject will reuse already-loaded hook.
			Out ("hook copy LOCKED (Game has DLL loaded) - keeping current hook, continuing")
			Out ("  " + $_.Exception.Message)
			try {
				Copy-Item -LiteralPath $srcDll -Destination $staged -Force
				Out ("Staged update: " + $staged)
				Out "To refresh hook later: close all Game.exe, copy _new over Pd2ForceKeysHook.dll, re-run bat"
			} catch {
				Out ("stage copy also failed: " + $_.Exception.Message)
			}
		}
	}

	$injPath = Join-Path $data "pd2_forcekeys.inject"
	$ingPath = Join-Path $data "pd2_forcekeys.ingame"
	Remove-Item -LiteralPath $injPath -Force -ErrorAction SilentlyContinue
	Remove-Item -LiteralPath $ingPath -Force -ErrorAction SilentlyContinue

	$g = @(Get-Process Game -ErrorAction SilentlyContinue)
	if ($g.Count -eq 0) {
		Out "WARNING: no Game.exe - start D2Bot first, then re-run this bat"
	} else {
		$gpids = ($g | ForEach-Object { $_.Id }) -join ","
		Out ("OK Game.exe pid=" + $gpids)
	}

	Out "Starting helper..."
	$p = Start-Process -FilePath $dstExe -WorkingDirectory $d2bs -WindowStyle Minimized -PassThru
	Out ("helper started pid=" + $p.Id)
	Start-Sleep -Seconds 4

	$hb = Join-Path $data "pd2_forcekeys.helper"
	if (Test-Path -LiteralPath $hb) {
		$hbText = (Get-Content -LiteralPath $hb -Raw).Trim()
		Out ("OK helper heartbeat: " + $hbText)
	} else {
		Out "FAIL no heartbeat file"
	}

	if (Test-Path -LiteralPath $injPath) {
		Out "--- inject ---"
		Get-Content -LiteralPath $injPath | ForEach-Object { Out $_ }
	} else {
		Out "FAIL no inject file (helper may be old build, or crashed)"
	}

	if (Test-Path -LiteralPath $ingPath) {
		Out "--- ingame ---"
		Get-Content -LiteralPath $ingPath | ForEach-Object { Out $_ }
	} else {
		Out "ingame missing (inject must succeed first)"
	}

	Out "Need: inject=OK AND hook=1 - then reload scripts / unstack"
	Out ("Full log: " + $log)
} catch {
	Out ("EXCEPTION: " + $_.Exception.Message)
	Out ($_ | Out-String)
}

Write-Host ""
Write-Host "Window stays open so you can read it. Log also at:"
Write-Host $log
Read-Host "Press Enter to close"

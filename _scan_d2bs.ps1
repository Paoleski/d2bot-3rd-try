$dll = 'C:\Games\Diablo II\ProjectD2-Realm\d2bot_3rd_try\d2bs\D2BS.dll'
$bytes = [IO.File]::ReadAllBytes($dll)
$text = [Text.Encoding]::ASCII.GetString($bytes)
foreach ($s in @('keyDown','KeyDown','keyUp','KeyUp','sendKey','clickItem','LeftClickItem','js_keyDown','keydown','GetAsyncKeyState','dwClickType')) {
  if ($text.IndexOf($s) -ge 0) { Write-Output "FOUND $s" } else { Write-Output "missing $s" }
}
Write-Output ("dll size=" + $bytes.Length)

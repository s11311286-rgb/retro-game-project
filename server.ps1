# 輕量級本機靜態伺服器 (支援 ES6 Module MIME 類型)
$port = 8080
$url = "http://localhost:$port/"
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($url)

try {
    $listener.Start()
} catch {
    $port = 8081
    $url = "http://localhost:$port/"
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add($url)
    $listener.Start()
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " ★ 五子棋模組化專案已成功啟動！" -ForegroundColor Green
Write-Host " 本機網址: $url" -ForegroundColor Yellow
Write-Host " 正在為您開啟瀏覽器..." -ForegroundColor Gray
Write-Host " (如欲結束伺服器，請直接關閉此命令視窗)" -ForegroundColor DarkGray
Write-Host "========================================" -ForegroundColor Cyan

Start-Process $url

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $path = $request.Url.LocalPath.Replace('/', '\')
        if ($path -eq "\" -or $path -eq "") {
            $path = "\index.html"
        }

        $localFilePath = Join-Path $PSScriptRoot $path.TrimStart('\')

        if (Test-Path $localFilePath -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($localFilePath)
            $ext = [System.IO.Path]::GetExtension($localFilePath).ToLower()

            $mime = switch ($ext) {
                ".html" { "text/html; charset=utf-8" }
                ".css"  { "text/css; charset=utf-8" }
                ".js"   { "application/javascript; charset=utf-8" }
                ".json" { "application/json; charset=utf-8" }
                ".png"  { "image/png" }
                ".jpg"  { "image/jpeg" }
                ".svg"  { "image/svg+xml" }
                ".ico"  { "image/x-icon" }
                default { "application/octet-stream" }
            }

            $response.ContentType = $mime
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
        }
        $response.Close()
    } catch {
        # 忽略用戶關閉連線或中斷
    }
}

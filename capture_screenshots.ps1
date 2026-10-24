$backendPath = "C:\Users\mailm\.gemini\antigravity\scratch\fixtrack-qr\backend"
$frontendPath = "C:\Users\mailm\.gemini\antigravity\scratch\fixtrack-qr\frontend"
$screenshotsDir = "C:\Users\mailm\.gemini\antigravity\scratch\fixtrack-qr\screenshots"
$edgePath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$viteBin = "node_modules\vite\bin\vite.js"

Write-Host "Starting Backend Server..."
$backendProc = Start-Process node -ArgumentList "src/server.js" -WorkingDirectory $backendPath -PassThru

Write-Host "Starting Frontend Preview..."
$frontendProc = Start-Process node -ArgumentList "$viteBin preview --port 5173" -WorkingDirectory $frontendPath -PassThru

Start-Sleep -Seconds 5

try {
    $targets = @(
        @{ name = "01_home_landing_page.png"; url = "http://localhost:5173/" },
        @{ name = "02_qr_issue_reporting_form.png"; url = "http://localhost:5173/report?code=LOC-SCI-101" },
        @{ name = "03_login_screen.png"; url = "http://localhost:5173/login" },
        @{ name = "04_student_dashboard.png"; url = "http://localhost:5173/student-dashboard?demo=student" },
        @{ name = "05_admin_dashboard.png"; url = "http://localhost:5173/admin-dashboard?demo=admin" },
        @{ name = "06_manage_locations_qr_plaques.png"; url = "http://localhost:5173/locations?demo=admin" }
    )

    foreach ($t in $targets) {
        $outFile = Join-Path $screenshotsDir $t.name
        Write-Host "Capturing $($t.name)..."
        & $edgePath --headless --disable-gpu --window-size=1280,850 --virtual-time-budget=2000 --screenshot="$outFile" "$($t.url)"
        Start-Sleep -Seconds 1
    }
    Write-Host "All screenshots captured successfully!"
} finally {
    Write-Host "Stopping servers..."
    Stop-Process -Id $backendProc.Id -Force -ErrorAction SilentlyContinue
    if ($frontendProc) {
        Stop-Process -Id $frontendProc.Id -Force -ErrorAction SilentlyContinue
    }
}

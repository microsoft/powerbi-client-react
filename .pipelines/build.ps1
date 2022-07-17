$exitCode = 0;

Write-Host "start: npm run build"
& npm run build
Write-Host "done: npm run build"

$exitCode += $LASTEXITCODE;

# Check linting
Write-Host "start: npm run lint"
& npm run lint
Write-Host "done: npm run lint"

$exitCode += $LASTEXITCODE;

Write-Host "start: Get dist folder files"
& dir "dist"
$hasAnySubdir = (Get-ChildItem -Force -Directory './dist').Count -gt 0
If ($hasAnySubdir) {
    Write-Host "Error: dist folder has subfolders!"
    $exitCode += 1;
}
Write-Host "Done: Get dist folder files"

exit $exitCode
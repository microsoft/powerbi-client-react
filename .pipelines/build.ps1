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
$dir = './dist'
$hasAnySubdir = (Get-ChildItem -Force -Directory $dir).Count -gt 0
Write-Host "dist folder has subdirs: $hasAnySubdir"
$exitCode += If ($hasAnySubdir) {1} Else {0};
Write-Host "Done: Get dist folder files"

exit $exitCode
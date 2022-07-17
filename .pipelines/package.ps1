$exitCode = 0;

Write-Host "start: npm pack"
& npm pack
Write-Host "done: npm pack"

$exitCode += $LASTEXITCODE;

Write-Host "start: Get content of current folder"
& dir
Write-Host "done: Get content of current folder"

$exitCode += $LASTEXITCODE;

Write-Host "start: test package"
& .\.pipelines\test_package.ps1
Write-Host "done: test package"

$exitCode += $LASTEXITCODE;

exit $exitCode
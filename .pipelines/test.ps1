$exitCode = 0;

Write-Host "start: npm run test"
& cd .\React\powerbi-client-react
& npm run test
Write-Host "done: npm run test"

$exitCode += $LASTEXITCODE;

exit $exitCode;
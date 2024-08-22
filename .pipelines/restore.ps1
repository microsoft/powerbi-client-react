Write-Host "Start build ..."
Write-Host  "Global node/npm paths  ..."
& where.exe npm
& where.exe node

Write-Host "Global node version"
& node -v

Write-Host "Global npm version"
& npm -v

$exitCode = 0;

Write-Host "start: try install latest npm version"
& npm install npm@latest -g --globalconfig "$env:REPOROOT\react\.npmrc"
Write-Host "done: try install latest npm version"

# Do not update $exitCode because we do not want to fail if install latest npm version fails.

Write-Host "start: npm install"
& cd .\React\powerbi-client-react
& npm install --no-audit --no-save
Write-Host "done: npm install"
$exitCode += $LASTEXITCODE;

exit $exitCode
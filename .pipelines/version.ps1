try {
  # package.json is in root folder, while version.ps1 runs in .pipelines folder.
  $version = (Get-Content "package.json") -join "`n" | ConvertFrom-Json | Select -ExpandProperty "version"
  $revision = $env:CDP_DEFINITION_BUILD_COUNT
  $buildNumber = "$version.$revision"

  Write-Host "Build Number is" $buildNumber

  Write-Host "##vso[task.setvariable variable=CustomBuildNumber]${buildNumber}"     # This will allow you to use it from env var in later steps of the same phase
}
catch {
  Write-Error $_.Exception
  exit 1;
}

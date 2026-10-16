$ErrorActionPreference = 'Stop'
$taskRoot = Split-Path -Parent $PSScriptRoot
$taskSource = Join-Path $taskRoot 'output/villabumi-site'
$taskZip = Join-Path $taskRoot 'output/villabumi-hostinger-source.zip'
if (-not (Test-Path -LiteralPath (Join-Path $taskSource 'package-lock.json'))) {
  throw 'Prepare the app and run npm install --package-lock-only in output/villabumi-site first.'
}
$taskNames = @('src','public','tests','package.json','package-lock.json','tsconfig.json','next.config.ts','.env.example','.gitignore','DEPLOYMENT.md')
$taskFiles = $taskNames | ForEach-Object { Join-Path $taskSource $_ }
Compress-Archive -LiteralPath $taskFiles -DestinationPath $taskZip -Force
Get-Item -LiteralPath $taskZip | Select-Object FullName, Length

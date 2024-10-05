Write-Host "Installing node modules..."
$zipPath = ".\function.zip"
Write-Host "Creating ZIP file for deployment..."
if (Test-Path $zipPath) {
    Remove-Item $zipPath
    Write-Host "Existing ZIP file removed."
}
Compress-Archive -Path "code/*" -DestinationPath $zipPath
Write-Host "ZIP file created: $zipPath"
Write-Host "Done!"

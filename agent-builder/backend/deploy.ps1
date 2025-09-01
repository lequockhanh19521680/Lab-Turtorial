# Tự bypass execution policy nếu cần
if ($MyInvocation.ScriptName -ne "") {
    $thisScript = $MyInvocation.ScriptName
    if ($Host.Version.Major -gt 1) {
        $scriptPath = $thisScript
    }
    else {
        $scriptPath = [System.IO.Path]::GetFullPath($thisScript)
    }
    if (Test-Path $scriptPath) {
        powershell -ExecutionPolicy Bypass -File $scriptPath
        exit $LASTEXITCODE
    }
}

# Lấy giá trị từ AWS SSM Parameter Store
$GoogleClientId = aws ssm get-parameter --name "/agent-builder/dev/google-oauth-client-id" --with-decryption --query "Parameter.Value" --output text
$GoogleClientSecret = aws ssm get-parameter --name "/agent-builder/dev/google-oauth-client-secret" --with-decryption --query "Parameter.Value" --output text

# Deploy với SAM
sam deploy `
    --stack-name agent-builder-sam `
    --region us-east-1 `
    --capabilities CAPABILITY_IAM `
    --no-confirm-changeset `
    --parameter-overrides Environment=dev GoogleClientId=$GoogleClientId GoogleClientSecret=$GoogleClientSecret

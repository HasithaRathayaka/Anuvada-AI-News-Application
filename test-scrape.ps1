Invoke-RestMethod -Uri "http://localhost:3000/api/scrape" -Method Post -Headers @{
    "x-biasly-admin-secret" = "my-admin-secret"
}

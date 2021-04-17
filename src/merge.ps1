$PSDefaultParameterValues['Out-File:Encoding'] = 'utf8NoBOM'
Get-ChildItem -include *.ts -rec | ForEach-Object {Get-Content $_; ""} | Out-File ..\main.ts
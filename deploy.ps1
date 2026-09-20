$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
& "C:\Users\ASUS2\AppData\Roaming\npm\wrangler.cmd" pages deploy . --project-name=createstuff-ai --branch=main 2>&1

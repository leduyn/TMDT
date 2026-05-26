# Build mapping from class name -> new package
$mapping = @{}
Get-Content "mapping.csv" | ForEach-Object {
    $parts = $_.Split(",")
    if ($parts.Length -eq 2 -and $parts[0].Trim() -ne "") {
        $mapping[$parts[0].Trim()] = $parts[1].Trim()
    }
}

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$files = Get-ChildItem -Recurse -Include *.java

foreach ($file in $files) {
    $lines = [System.IO.File]::ReadAllLines($file.FullName, [System.Text.Encoding]::UTF8)
    $changed = $false
    $newLines = @()

    # Fix package declaration for module files
    $isModuleFile = $file.FullName.Contains("com\anhtin\tmdt\backend\modules")

    foreach ($line in $lines) {
        $newLine = $line

        # Fix package declaration
        if ($isModuleFile -and $line -match "^package\s+com\.anhtin\.tmdt\.backend\.") {
            $relative = $file.FullName.Substring($file.FullName.IndexOf("com\anhtin\tmdt\backend\modules"))
            $pkg = $relative.Replace("\", ".").Replace(".java", "")
            $pkg = $pkg.Substring(0, $pkg.LastIndexOf("."))
            $newLine = "package $pkg;"
            if ($newLine -ne $line) { $changed = $true }
        }

        # Fix ANY import that references old packages
        if ($line -match "^import\s+com\.anhtin\.tmdt\.backend\.(?!modules\.)([a-zA-Z0-9\.]+)\.([A-Z][a-zA-Z0-9]*);") {
            $className = $matches[2]
            if ($mapping.ContainsKey($className)) {
                $newPkg = $mapping[$className]
                $newLine = "import $newPkg.$className;"
                if ($newLine -ne $line) { $changed = $true }
            }
        }

        # Also fix imports with old credit package pattern
        if ($line -match "^import\s+com\.anhtin\.tmdt\.backend\.credit\.([a-zA-Z0-9\.]+)\.([A-Z][a-zA-Z0-9]*);") {
            $className = $matches[2]
            if ($mapping.ContainsKey($className)) {
                $newPkg = $mapping[$className]
                $newLine = "import $newPkg.$className;"
                if ($newLine -ne $line) { $changed = $true }
            }
        }

        # Remove wildcard imports to old packages
        if ($line -match "^import\s+com\.anhtin\.tmdt\.backend\.(controller|service|repository|entity|dto)\.\*;") {
            continue  # skip this line entirely
        }

        $newLines += $newLine
    }

    if ($changed) {
        [System.IO.File]::WriteAllLines($file.FullName, $newLines, $utf8NoBom)
        Write-Host "Fixed: $($file.Name)"
    }
}

Write-Host "`nDone. All old-style imports replaced."

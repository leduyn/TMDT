$mapping = @{}
Get-Content "mapping.csv" | ForEach-Object {
    $parts = $_.Split(",")
    if ($parts.Length -eq 2) {
        $mapping[$parts[0]] = $parts[1]
    }
}

$files = Get-ChildItem -Recurse -Include *.java

foreach ($file in $files) {
    $content = Get-Content $file.FullName
    $changed = $false
    $newContent = @()

    $isModuleFile = $file.FullName.Contains("com\anhtin\tmdt\backend\modules")

    foreach ($line in $content) {
        $newLine = $line

        # 1. Fix package declaration for module files
        if ($isModuleFile -and $line -match "^package\s+com\.anhtin\.tmdt\.backend\.(controller|service|repository|entity|dto|credit)") {
            $relative = $file.FullName.Substring($file.FullName.IndexOf("com\anhtin\tmdt\backend\modules"))
            $package = $relative.Replace("\", ".").Replace(".java", "")
            $package = $package.Substring(0, $package.LastIndexOf("."))
            $newLine = "package $package;"
            if ($newLine -ne $line) { $changed = $true }
        }

        # 2. Fix imports
        if ($line -match "^import\s+(com\.anhtin\.tmdt\.backend\.(controller|service|repository|entity|dto|credit|modules)\.[a-zA-Z0-9\.]+);") {
            $fullImport = $matches[1]
            $className = $fullImport.Substring($fullImport.LastIndexOf(".") + 1)
            
            if ($mapping.ContainsKey($className)) {
                $newPkg = $mapping[$className]
                $newLine = "import $newPkg.$className;"
                if ($newLine -ne $line) { $changed = $true }
            }
        }

        $newContent += $newLine
    }

    if ($changed) {
        $newContent | Set-Content $file.FullName -Encoding utf8
        Write-Host "Updated $($file.Name)"
    }
}

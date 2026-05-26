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
    
    # Extract current package
    $currentPackage = ""
    foreach ($line in $content) {
        if ($line -match "^package\s+([a-zA-Z0-9\.]+);") {
            $currentPackage = $matches[1]
            break
        }
    }

    # Track existing imports
    $existingImports = @{}
    foreach ($line in $content) {
        if ($line -match "^import\s+([a-zA-Z0-9\.]+);") {
            $existingImports[$matches[1]] = $true
        }
    }

    # Find classes that need importing
    $classesToImport = @()
    foreach ($className in $mapping.Keys) {
        $targetPackage = $mapping[$className]
        
        # Don't import if it's the current package
        if ($targetPackage -eq $currentPackage) { continue }
        
        # Don't import if already imported
        if ($existingImports.ContainsKey("$targetPackage.$className")) { continue }

        # Check if class name is used in the code (avoiding partial matches like "Agency" in "AgencyDTO")
        # We look for the class name as a whole word, not preceded by a dot (which would mean it's already qualified)
        if ($content -match "\b$className\b" -and $content -notmatch "\b[a-zA-Z0-9\.]+\.$className\b") {
            $classesToImport += "import $targetPackage.$className;"
        }
    }

    if ($classesToImport.Count -gt 0) {
        $changed = $true
        $insertionPoint = -1
        for ($i = 0; $i -lt $content.Count; $i++) {
            if ($content[$i] -match "^package" -or $content[$i] -match "^import") {
                $insertionPoint = $i
            }
        }
        
        for ($i = 0; $i -lt $content.Count; $i++) {
            $newContent += $content[$i]
            if ($i -eq $insertionPoint) {
                foreach ($imp in $classesToImport) {
                    $newContent += $imp
                }
            }
        }
    } else {
        $newContent = $content
    }

    if ($changed) {
        $newContent | Set-Content $file.FullName -Encoding utf8
        Write-Host "Added imports to $($file.Name)"
    }
}

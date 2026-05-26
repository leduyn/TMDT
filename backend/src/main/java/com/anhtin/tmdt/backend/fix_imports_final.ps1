$mapping = @{}
Get-Content "mapping.csv" | ForEach-Object {
    $parts = $_.Split(",")
    if ($parts.Length -eq 2) {
        $mapping[$parts[0]] = $parts[1]
    }
}

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$files = Get-ChildItem -Recurse -Include *.java

foreach ($file in $files) {
    # Read as UTF-8 specifically
    $content = [System.IO.File]::ReadAllLines($file.FullName, [System.Text.Encoding]::UTF8)
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

    # Identify if it's a module file to fix its own package declaration
    $isModuleFile = $file.FullName.Contains("com\anhtin\tmdt\backend\modules")
    
    # Track existing imports
    $existingImports = @{}
    foreach ($line in $content) {
        if ($line -match "^import\s+([a-zA-Z0-9\.]+);") {
            $existingImports[$matches[1]] = $true
        }
    }

    # 1. Update package and existing imports first
    $processedContent = @()
    foreach ($line in $content) {
        $newLine = $line
        
        # Fix package declaration for module files
        if ($isModuleFile -and $line -match "^package\s+com\.anhtin\.tmdt\.backend\.") {
            $relative = $file.FullName.Substring($file.FullName.IndexOf("com\anhtin\tmdt\backend\modules"))
            $package = $relative.Replace("\", ".").Replace(".java", "")
            $package = $package.Substring(0, $package.LastIndexOf("."))
            $newLine = "package $package;"
            if ($newLine -ne $line) { $changed = $true }
            $currentPackage = $package
        }

        # Fix existing imports that follow the old pattern
        if ($line -match "^import\s+(com\.anhtin\.tmdt\.backend\.(controller|service|repository|entity|dto|credit|modules)\.[a-zA-Z0-9\.]+);") {
            $fullImport = $matches[1]
            $className = $fullImport.Substring($fullImport.LastIndexOf(".") + 1)
            
            if ($mapping.ContainsKey($className)) {
                $newPkg = $mapping[$className]
                $newLine = "import $newPkg.$className;"
                if ($newLine -ne $line) { $changed = $true }
                $existingImports["$newPkg.$className"] = $true
            }
        }
        $processedContent += $newLine
    }

    # 2. Add missing imports
    $classesToImport = @()
    foreach ($className in $mapping.Keys) {
        $targetPackage = $mapping[$className]
        if ($targetPackage -eq $currentPackage) { continue }
        if ($existingImports.ContainsKey("$targetPackage.$className")) { continue }

        # Check if class name is used as a whole word
        if ($processedContent -match "\b$className\b" -and $processedContent -notmatch "\b[a-zA-Z0-9\.]+\.$className\b") {
            $classesToImport += "import $targetPackage.$className;"
        }
    }

    if ($classesToImport.Count -gt 0) {
        $changed = $true
        $insertionPoint = -1
        for ($i = 0; $i -lt $processedContent.Count; $i++) {
            if ($processedContent[$i] -match "^package" -or $processedContent[$i] -match "^import") {
                $insertionPoint = $i
            }
        }
        
        for ($i = 0; $i -lt $processedContent.Count; $i++) {
            $newContent += $processedContent[$i]
            if ($i -eq $insertionPoint) {
                foreach ($imp in $classesToImport) {
                    $newContent += $imp
                }
            }
        }
    } else {
        $newContent = $processedContent
    }

    if ($changed) {
        [System.IO.File]::WriteAllLines($file.FullName, $newContent, $utf8NoBom)
        Write-Host "Processed $($file.Name)"
    }
}

# Build mapping from class name -> new full qualified name
$mapping = @{}
Get-Content "mapping.csv" | ForEach-Object {
    $parts = $_.Split(",")
    if ($parts.Length -eq 2 -and $parts[0].Trim() -ne "") {
        $className = $parts[0].Trim()
        $pkg = $parts[1].Trim()
        $mapping[$className] = "$pkg.$className"
    }
}

# Old package prefixes to replace
$oldPrefixes = @(
    "com.anhtin.tmdt.backend.controller.",
    "com.anhtin.tmdt.backend.service.",
    "com.anhtin.tmdt.backend.repository.",
    "com.anhtin.tmdt.backend.entity.",
    "com.anhtin.tmdt.backend.dto.request.",
    "com.anhtin.tmdt.backend.dto.response.",
    "com.anhtin.tmdt.backend.credit.controller.",
    "com.anhtin.tmdt.backend.credit.service.",
    "com.anhtin.tmdt.backend.credit.repository.",
    "com.anhtin.tmdt.backend.credit.entity.",
    "com.anhtin.tmdt.backend.credit.dto.",
    "com.anhtin.tmdt.backend.credit.scheduler."
)

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$files = Get-ChildItem -Recurse -Include *.java

foreach ($file in $files) {
    $text = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    $originalText = $text

    # Fix package declaration for module files
    $isModuleFile = $file.FullName.Contains("com\anhtin\tmdt\backend\modules")
    if ($isModuleFile) {
        $relative = $file.FullName.Substring($file.FullName.IndexOf("com\anhtin\tmdt\backend\modules"))
        $pkg = $relative.Replace("\", ".").Replace(".java", "")
        $pkg = $pkg.Substring(0, $pkg.LastIndexOf("."))
        $text = $text -replace "^package\s+com\.anhtin\.tmdt\.backend\.[a-zA-Z0-9\.]+;", "package $pkg;"
    }

    # Replace all old fully-qualified class references with new ones
    foreach ($prefix in $oldPrefixes) {
        foreach ($className in $mapping.Keys) {
            $oldFQN = "$prefix$className"
            $newFQN = $mapping[$className]
            if ($oldFQN -ne $newFQN) {
                $escapedOld = [regex]::Escape($oldFQN)
                $text = $text -replace $escapedOld, $newFQN
            }
        }
    }

    if ($text -ne $originalText) {
        [System.IO.File]::WriteAllText($file.FullName, $text, $utf8NoBom)
        Write-Host "Fixed: $($file.Name)"
    }
}

Write-Host "`nDone. All fully-qualified references replaced."

# Обработка фото: кроп (по фракциям) + ресайз до квадрата 900x900, JPEG q82
# Использование: powershell -File process-final.ps1
# Грабли учтены: [double] касты везде, где Math работает с double
param()
Add-Type -AssemblyName System.Drawing

$srcDir = "C:\Users\N0ll\Desktop\white_label\QuickCart\scripts\photo-candidates"
$outMenu = "C:\Users\N0ll\Desktop\white_label\QuickCart\public\images\menu"
$outHero = "C:\Users\N0ll\Desktop\white_label\QuickCart\public\images\hero"
New-Item -ItemType Directory -Force -Path $outMenu | Out-Null
New-Item -ItemType Directory -Force -Path $outHero | Out-Null

function Convert-Image {
  param(
    [string]$Source,
    [string]$Dest,
    [int]$Size = 900,
    [double]$CropX = 0.0,   # левая граница кропа (доля 0..1)
    [double]$CropW = 0.0    # ширина кропа (доля 0..1); 0 = весь кадр (центр-сквад)
  )
  $srcPath = Join-Path $srcDir $Source
  if (-not (Test-Path $srcPath)) { Write-Host "MISS $Source"; return }
  $img = [System.Drawing.Image]::FromFile($srcPath)
  try {
    $w = [double]$img.Width
    $h = [double]$img.Height

    if ($CropW -gt 0) {
      # кроп по горизонтали по фракциям, затем центр-сквад внутри кропа
      $cropPx = [int]([double]$w * $CropW)
      $cropLeft = [int]([double]$w * $CropX)
      $side = [Math]::Min([double]$cropPx, $h)
      $rectX = $cropLeft + [int](([double]$cropPx - $side) / 2.0)
      $rectY = [int](($h - $side) / 2.0)
    } else {
      $side = [Math]::Min($w, $h)
      $rectX = [int](($w - $side) / 2.0)
      $rectY = [int](($h - $side) / 2.0)
    }

    $dst = New-Object System.Drawing.Bitmap($Size, $Size)
    $gfx = [System.Drawing.Graphics]::FromImage($dst)
    $gfx.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $gfx.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $gfx.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $srcRect = New-Object System.Drawing.Rectangle($rectX, $rectY, $side, $side)
    $gfx.DrawImage($img, (New-Object System.Drawing.Rectangle(0, 0, $Size, $Size)), $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
    $gfx.Dispose()

    $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
    $ep = New-Object System.Drawing.Imaging.EncoderParameters(1)
    $ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]82)
    $dst.Save($Dest, $codec, $ep)
    $dst.Dispose()
    Write-Host "OK $Source -> $Dest"
  } finally {
    $img.Dispose()
  }
}

function Convert-Hero {
  param([string]$Source, [string]$Dest, [int]$Width = 1600)
  $srcPath = Join-Path $srcDir $Source
  if (-not (Test-Path $srcPath)) { Write-Host "MISS $Source"; return }
  $img = [System.Drawing.Image]::FromFile($srcPath)
  try {
    $w = [double]$img.Width; $h = [double]$img.Height
    # кроп 16:10 по центру
    $targetRatio = 1.6
    $cropW = $w; $cropH = $w / $targetRatio
    if ($cropH -gt $h) { $cropH = $h; $cropW = $h * $targetRatio }
    $rectX = [int](($w - $cropW) / 2.0)
    $rectY = [int](($h - $cropH) / 2.0)
    $outH = [int]([double]$Width / $targetRatio)

    $dst = New-Object System.Drawing.Bitmap($Width, $outH)
    $gfx = [System.Drawing.Graphics]::FromImage($dst)
    $gfx.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $srcRect = New-Object System.Drawing.Rectangle($rectX, $rectY, [int]$cropW, [int]$cropH)
    $gfx.DrawImage($img, (New-Object System.Drawing.Rectangle(0, 0, $Width, $outH)), $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
    $gfx.Dispose()

    $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
    $ep = New-Object System.Drawing.Imaging.EncoderParameters(1)
    $ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]84)
    $dst.Save($Dest, $codec, $ep)
    $dst.Dispose()
    Write-Host "HERO $Source -> $Dest"
  } finally {
    $img.Dispose()
  }
}

# --- Меню: шаурма ---
Convert-Image -Source "shawarma_cut.jpg"       -Dest "$outMenu\topovaya.jpg"
Convert-Image -Source "wrap_halves.jpg"        -Dest "$outMenu\double_chicken.jpg"
Convert-Image -Source "shawarma_fries.jpg"     -Dest "$outMenu\cheese.jpg"
Convert-Image -Source "wrap_plate.jpg"         -Dest "$outMenu\spicy.jpg"
Convert-Image -Source "shawarma_yellow.jpg"    -Dest "$outMenu\mushrooms.jpg"
Convert-Image -Source "shawarma_hand.jpg"      -Dest "$outMenu\student.jpg"
Convert-Image -Source "wrap_chips.jpg"         -Dest "$outMenu\pineapple.jpg"

# --- Питы ---
Convert-Image -Source "gyro_authentic.jpg"     -Dest "$outMenu\pita_top.jpg"
Convert-Image -Source "falafel_authentic.jpg"  -Dest "$outMenu\pita_double.jpg"  -CropX 0.45 -CropW 0.55
Convert-Image -Source "pita_pocket1.jpg"       -Dest "$outMenu\pita_cheese.jpg"
Convert-Image -Source "gyro_authentic.jpg"     -Dest "$outMenu\pita_spicy.jpg"   -CropX 0.0  -CropW 0.5

# --- Хот-доги / детское ---
Convert-Image -Source "hotdog_mustard.jpg"     -Dest "$outMenu\hotdog.jpg"
Convert-Image -Source "hotdog_beef1.jpg"       -Dest "$outMenu\hotdog_meat.jpg"
Convert-Image -Source "shawarma_cut.jpg"       -Dest "$outMenu\kids_shawarma.jpg" -CropX 0.0 -CropW 0.5
Convert-Image -Source "corndog_three.jpg"      -Dest "$outMenu\kids_hotdog.jpg"

# --- Соусы (одна групповая) ---
Convert-Image -Source "sauce_three.jpg"        -Dest "$outMenu\sauce.jpg"

# --- Напитки ---
Convert-Image -Source "tea_glass.jpg"          -Dest "$outMenu\tea_black.jpg"
Convert-Image -Source "tea_hand.jpg"           -Dest "$outMenu\tea_green.jpg"
Convert-Image -Source "coffee_paper.jpg"       -Dest "$outMenu\coffee.jpg"

# --- Хиро ---
Convert-Hero -Source "doner_rotisserie.jpg"    -Dest "$outHero\hero1.jpg"
Convert-Hero -Source "shawarma_cut.jpg"        -Dest "$outHero\hero2.jpg"

Write-Host "ALL DONE"

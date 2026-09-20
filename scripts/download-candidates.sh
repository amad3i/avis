#!/bin/bash
# Скачивание кандидатов фото для ревью
DIR="C:/Users/N0ll/Desktop/white_label/QuickCart/scripts/photo-candidates"
mkdir -p "$DIR"
cd "$DIR"

dl() {
  local name="$1"; local url="$2"
  [ -f "$name.jpg" ] && { echo "skip $name"; return; }
  curl -sL --max-time 60 -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" -o "$name.jpg" "$url" && echo "ok $name ($(stat -c%s "$name.jpg" 2>/dev/null) bytes)" || echo "FAIL $name"
  sleep 2
}

# Шаурма / врапы
dl shawarma_cut        "https://pd.w.org/2026/07/8636a6d0de1bdd797.99183133-2048x1536.jpg"
dl shawarma_closeup    "https://pd.w.org/2026/04/96669e2feaf414be2.04346581-1152x2048.jpeg"
dl shawarma_yellow     "https://pd.w.org/2026/05/13769f707ecbb8a94.92045478-1536x2048.jpg"
dl shawarma_platter    "https://pd.w.org/2026/04/24369e2fe70c2a9a7.61143656-2048x1152.jpeg"
dl shawarma_unwrapped  "https://pd.w.org/2026/04/59369ce0a23cb3b04.41824266-1536x2048.jpg"
dl shawarma_hand       "https://pd.w.org/2026/01/216967b3639ae326.63206282-1350x2048.jpeg"
dl shawarma_fries      "https://pd.w.org/2025/01/94967901555caebd7.38630773-1536x2048.jpg"
dl doner_rotisserie    "https://pd.w.org/2026/05/66a16de9b0bc556.99808043-1536x2048.jpg"

# Пита
dl pita_pocket1        "https://images.rawpixel.com/editor_1024/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTExL2ZsNTE0MzA3MDUxNTYtaW1hZ2UuanBn.jpg"
dl pita_pocket2        "https://images.rawpixel.com/editor_1024/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIzLTAzL2ZsNTE0MzE2NzM2NzUtaW1hZ2UuanBn.jpg"

# Хот-доги
dl hotdog_beef1        "https://images.rawpixel.com/editor_1024/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvYTAxOS1qYWt1YmstMDY4Ni1hd2Vzb21lLWJlZWYtaG90LWRvZy5qcGc.jpg"
dl hotdog_hands        "https://images.rawpixel.com/editor_1024/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvYTAxOS1qYWt1YmstMDY1MS1ob3QtZG9nLWluLWhhbmRzLmpwZw.jpg"
dl hotdog_mustard      "https://pd.w.org/2026/05/5726a0bddef08c449.25178208-1612x2048.jpeg"
dl hotdog_spicy        "https://pd.w.org/2025/01/47767979c38bc5722.42445171-2048x1536.jpg"
dl hotdog_brat         "https://pd.w.org/2023/06/436479283d4c34d6.14713393-2048x1536.jpg"
dl hotdog_red          "https://pd.w.org/2025/01/608679431c04581d0.77677624-1365x2048.jpg"

# Корн-доги (детская линия)
dl corndog_three       "https://pd.w.org/2026/05/3516a167dcad56076.39028797-1536x2048.jpeg"
dl corndog_plate       "https://pd.w.org/2026/02/6236990b01bc4c930.38467152-1536x2048.jpeg"

# Соусы
dl sauce_three         "https://pd.w.org/2025/06/914685c7681acb2f5.98066065-1536x2048.jpg"
dl sauce_ketchup_mayo  "https://pd.w.org/2026/05/92569fb43ed408f27.20347356-1153x2048.jpg"
dl sauce_bowls         "https://pd.w.org/2026/05/9526a17411e2a45e2.69958933-1542x2048.jpg"
dl sauce_dips          "https://images.rawpixel.com/editor_1024/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvcHg3ODUyOTQtaW1hZ2Uta3d2dXpveXIuanBn.jpg"

# Чай / кофе
dl tea_glass           "https://pd.w.org/2024/04/500661ab0c632d4d7.68833914-1152x2048.jpeg"
dl tea_chai            "https://pd.w.org/2024/02/2265bde3f0757017.06056520-1536x2048.jpg"
dl tea_hand            "https://pd.w.org/2026/05/3016a19ad929666a1.72333235-1536x2048.jpeg"
dl coffee_cup1         "https://cdn.stocksnap.io/img-thumbs/960w/F2BUVE4HG3.jpg"
dl coffee_paper        "https://pd.w.org/2025/09/64368db59a00cf8b8.32522841-1536x2048.jpg"

# Хиро
dl hero_rotisserie     "https://pd.w.org/2026/05/66a16de9b0bc556.99808043-1536x2048.jpg"
dl hero_kabobs         "https://cdn.stocksnap.io/img-thumbs/960w/LVXXHV4D98.jpg"
dl hero_skewer         "https://cdn.stocksnap.io/img-thumbs/960w/04XU0KPGN0.jpg"
dl hero_grillchicken   "https://cdn.stocksnap.io/img-thumbs/960w/ZKP84YCBWQ.jpg"
dl hero_fire           "https://cdn.stocksnap.io/img-thumbs/960w/BKRH7SD0D2.jpg"
dl hero_smoke          "https://cdn.stocksnap.io/img-thumbs/960w/9ORVHU9PQI.jpg"

echo "DONE"

# -*- coding: utf-8 -*-
import unicodedata
import re
import sys

sys.stdout.reconfigure(encoding="utf-8")


def generate_attribute_name(display_name):
    if not display_name:
        return "unknown"
    name = display_name.lower().strip()
    # Thay thế ký tự Việt không decompose được trong NFD
    name = name.replace("đ", "d").replace("ư", "u").replace("ơ", "o")
    decomposed = unicodedata.normalize("NFD", name)
    name = "".join(c for c in decomposed if unicodedata.category(c) != "Mn")
    name = re.sub(r"[^a-z0-9\s]", "_", name)
    name = re.sub(r"\s+", "_", name)
    name = re.sub(r"_+", "_", name).strip("_")
    return name if name else "unknown"


def parse_spec_text(spec_text, delimiter):
    result = {}
    if not spec_text:
        return result
    text = spec_text.strip()
    if text.startswith("- "):
        text = text[2:].strip()
    elif delimiter and text.startswith(delimiter):
        text = text[len(delimiter) :].strip()
    if not delimiter:
        _parse_item(text, result)
        return result
    for part in text.split(delimiter):
        _parse_item(part.strip(), result)
    return result


def _parse_item(part, result):
    if not part:
        return
    if part.startswith("- "):
        part = part[2:].strip()
    if not part:
        return
    colon_idx = part.find(":")
    if colon_idx > 0:
        label = part[:colon_idx].strip()
        value = part[colon_idx + 1 :].strip()
        if label:
            result[label] = value


spec_text = "- Dung tích xy lanh: 25.4cc - Đường kính x hành trình pít tông: 34 x 28 mm - Công suất: 1.1HP (3,000 vòng/phút) - Lam: Đầu sao 12 inch (3 tấc) - Xích: 22.5 mắc - Kiểu khởi động: Giật tay - Dung tích bình nhiên liệu: 190ml - Nhiên liệu sử dụng: Xăng pha nhớt 40:1 - Dung tích buồng nhớt: 150ml - Kích thước bao bì (DxRxC): 32 x 27 x 23.5 cm - Trọng lượng tịnh: 3.8 Kg - Trọng lượng gộp: 5.0 Kg"

print("=" * 100)
print("PHÂN TÍCH DỮ LIỆU THÔNG SỐ KỸ THUẬT")
print("=" * 100)

print("\n1. INPUT TEXT:")
print(spec_text[:120] + "...")
print()

print("2. text.trim()")
text = spec_text.strip()
print(f'   => text.startsWith("- ") = {text.startswith("- ")}')

if text.startswith("- "):
    text = text[2:].strip()
    print(f'   => Remove "- " prefix')
    print(f'   => text now: "{text[:60]}..."')

delimiter = " - "
parts = text.split(delimiter)
print(f"\n3. Split by '{delimiter}' => {len(parts)} parts")
print()

print("4. PARSED RESULTS:")
print("-" * 100)
print(f"{'#':<3} {'displayName':<48} {'slug':<35} {'value'}")
print("-" * 100)

result = {}
for i, part in enumerate(parts):
    p = part.strip()
    if p.startswith("- "):
        p = p[2:].strip()
    colon = p.find(":")
    if colon > 0:
        label = p[:colon].strip()
        value = p[colon + 1 :].strip()
        slug = generate_attribute_name(label)
        result[label] = value
        print(f"{i + 1:<3} {label:<48} {slug:<35} {value}")

print("=" * 100)
print(f"\n=> Tổng: {len(result)} attributes được parse thành công")
print("\n=> Mỗi attribute sẽ được:")
print("   - Tìm trong DB theo name (slug)")
print("   - Nếu chưa có -> tạo mới với displayName = label, isVariant = false")
print("   - Kiểm tra value đã tồn tại chưa")
print("   - Nếu chưa -> tạo mới")
print("   - Gán vào product_attribute_values")

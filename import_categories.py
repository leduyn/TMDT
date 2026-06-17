import json
import urllib.request
import urllib.parse
import sys
import ssl

sys.stdout.reconfigure(encoding="utf-8")

BASE_URL = "http://localhost:8080"
ssl_ctx = ssl.create_default_context()
ssl_ctx.check_hostname = False
ssl_ctx.verify_mode = ssl.CERT_NONE


def req(method, path, data=None, token=None):
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    body = json.dumps(data).encode("utf-8") if data else None
    r = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(r, context=ssl_ctx) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        err = e.read().decode("utf-8")
        print(f"  HTTP {e.code}: {err}")
        raise


def login():
    print("Logging in as admin...")
    r = req("POST", "/api/auth/signin", {"username": "admin", "password": "admin123"})
    token = r.get("token")
    if not token:
        print("Login failed:", r)
        sys.exit(1)
    print("Token obtained")
    return token


def import_categories(data, token):
    # Map bravo parent_id -> local id
    bravo_to_local = {}

    # Sort by category_level ascending
    data_sorted = sorted(data, key=lambda c: c["category_level"])

    total = len(data_sorted)
    for i, cat in enumerate(data_sorted, 1):
        bravo_id = cat["id"]
        name = cat["name"]
        level = cat["category_level"]
        parent_bravo_id = cat.get("parent_id", 0)

        # If parent_bravo_id is 0, it's a root category
        local_parent_id = None
        if parent_bravo_id and parent_bravo_id != 0:
            local_parent_id = bravo_to_local.get(parent_bravo_id)
            if not local_parent_id:
                print(
                    f"  [SKIP] Parent {parent_bravo_id} not found for '{name}' (bravo_id={bravo_id})"
                )
                continue

        # Build imageUrl from image + image_url
        image_url = None
        img = cat.get("image")
        img_base = cat.get("image_url")
        if img and img != "default.jpg" and img_base:
            image_url = img_base + img

        # Parse background_color
        bg_color = cat.get("background_color")
        if bg_color and isinstance(bg_color, str):
            bg_color = bg_color.strip()
        elif bg_color and isinstance(bg_color, list):
            bg_color = json.dumps(bg_color, ensure_ascii=False)

        payload = {
            "name": name,
            "parentId": local_parent_id,
            "imageUrl": image_url,
            "bravoId": bravo_id,
            "status": cat.get("status", 1),
            "priority": cat.get("priority", 0),
            "bravoSortValue": str(cat.get("bravo_sort_value", "")),
            "isBranch": cat.get("is_branch", 0),
            "showOnLeftMenu": cat.get("show_on_left_menu", 0),
            "displayStatus": cat.get("display_status", 1),
            "backgroundColor": bg_color,
        }

        try:
            result = req("POST", "/api/categories", payload, token)
            new_id = result["id"]
            bravo_to_local[bravo_id] = new_id
            print(
                f"  [{i}/{total}] Level {level}: '{name}' (bravo={bravo_id} -> local={new_id})"
            )
        except Exception as e:
            print(
                f"  [{i}/{total}] FAILED Level {level}: '{name}' (bravo={bravo_id}): {e}"
            )

    print(f"\nDone! Imported {len(bravo_to_local)}/{total} categories")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python import_categories.py <categories.json>")
        sys.exit(1)

    with open(sys.argv[1], "r", encoding="utf-8") as f:
        categories_data = json.load(f)

    if isinstance(categories_data, dict):
        # Handle {data: {records: [...]}} structure (Bravo API response)
        inner = categories_data.get("data") or categories_data
        if isinstance(inner, dict):
            for v in inner.values():
                if isinstance(v, list):
                    categories_data = v
                    break
        else:
            # Fallback: look for first top-level list value
            for v in categories_data.values():
                if isinstance(v, list):
                    categories_data = v
                    break

    print(f"Loaded {len(categories_data)} categories from file")

    token = login()
    import_categories(categories_data, token)

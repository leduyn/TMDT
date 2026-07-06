import type { CategoryDTO, ProductDTO } from '@/types'

export const MOCK_CATEGORIES: CategoryDTO[] = [
  { id: 1, name: 'Điện thoại', imageUrl: '', level: 1 },
  { id: 2, name: 'Laptop', imageUrl: '', level: 1 },
  { id: 3, name: 'Phụ kiện', imageUrl: '', level: 1 },
  { id: 4, name: 'Âm thanh', imageUrl: '', level: 1 },
  { id: 5, name: 'Đồng hồ', imageUrl: '', level: 1 },
  { id: 6, name: 'Máy tính bảng', imageUrl: '', level: 1 },
  { id: 7, name: 'Thiết bị mạng', imageUrl: '', level: 1 },
  { id: 8, name: 'Camera', imageUrl: '', level: 1 },
]

export const MOCK_PRODUCTS: ProductDTO[] = [
  { id: 1, name: 'iPhone 16 Pro Max 256GB', description: 'Chip A18 Pro, màn hình 6.9 inch OLED, camera 48MP', basePrice: 34990000, stockQuantity: 15, categoryId: 1, categoryName: 'Điện thoại', unit: 'cái', specification: 'A18 Pro, 256GB, 6.9" OLED, 48MP+12MP+12MP', productCode: 'IP16PM256' },
  { id: 2, name: 'Samsung Galaxy S25 Ultra', description: 'Snapdragon 8 Gen 4, màn hình 6.8 inch Dynamic AMOLED', basePrice: 32990000, stockQuantity: 12, categoryId: 1, categoryName: 'Điện thoại', unit: 'cái', specification: 'SD 8 Gen 4, 256GB, 6.8" AMOLED, 200MP+50MP+12MP+10MP', productCode: 'SGS25U' },
  { id: 3, name: 'Xiaomi 15 Pro', description: 'Chip Snapdragon 8 Gen 4, camera Leica 50MP', basePrice: 19990000, stockQuantity: 20, categoryId: 1, categoryName: 'Điện thoại', unit: 'cái', specification: 'SD 8 Gen 4, 256GB, 6.73" AMOLED, 50MP Leica', productCode: 'XM15P' },
  { id: 4, name: 'OPPO Find X8 Pro', description: 'MediaTek Dimensity 9400, camera Hasselblad 50MP', basePrice: 22990000, stockQuantity: 8, categoryId: 1, categoryName: 'Điện thoại', unit: 'cái', specification: 'Dimensity 9400, 256GB, 6.78" AMOLED, 50MP Hasselblad', productCode: 'OFX8P' },
  { id: 5, name: 'Google Pixel 10 Pro', description: 'Tensor G5, camera 50MP, Android thuần', basePrice: 25990000, stockQuantity: 5, categoryId: 1, categoryName: 'Điện thoại', unit: 'cái', specification: 'Tensor G5, 256GB, 6.7" OLED, 50MP+48MP+48MP', productCode: 'GP10P' },

  { id: 6, name: 'MacBook Pro 16 M4 Max', description: 'Chip M4 Max 16-core CPU, 40-core GPU, 48GB RAM', basePrice: 79990000, stockQuantity: 7, categoryId: 2, categoryName: 'Laptop', unit: 'cái', specification: 'M4 Max, 48GB, 1TB SSD, 16.2" Liquid Retina XDR', productCode: 'MBP16M4' },
  { id: 7, name: 'Dell XPS 16 2025', description: 'Intel Core Ultra 9 285H, RTX 5080, 32GB RAM', basePrice: 55990000, stockQuantity: 6, categoryId: 2, categoryName: 'Laptop', unit: 'cái', specification: 'Ultra 9 285H, 32GB, 1TB SSD, RTX 5080, 16.3" OLED', productCode: 'DXPS16' },
  { id: 8, name: 'ASUS ROG Zephyrus G16', description: 'AMD Ryzen AI 9 HX 370, RTX 5090, 32GB RAM', basePrice: 59990000, stockQuantity: 4, categoryId: 2, categoryName: 'Laptop', unit: 'cái', specification: 'Ryzen AI 9, 32GB, 1TB SSD, RTX 5090, 16" OLED 240Hz', productCode: 'G16ROG' },
  { id: 9, name: 'Lenovo ThinkPad X1 Gen 13', description: 'Intel Core Ultra 7 265H, 16GB RAM, 1TB SSD', basePrice: 42990000, stockQuantity: 10, categoryId: 2, categoryName: 'Laptop', unit: 'cái', specification: 'Ultra 7 265H, 16GB, 1TB SSD, 14" 2.8K OLED', productCode: 'TPX1G13' },
  { id: 10, name: 'HP Spectre x360 16', description: 'Intel Core Ultra 9 285H, 32GB RAM, 2TB SSD', basePrice: 47990000, stockQuantity: 3, categoryId: 2, categoryName: 'Laptop', unit: 'cái', specification: 'Ultra 9 285H, 32GB, 2TB SSD, 16" 3K OLED Touch', productCode: 'HPSC16' },

  { id: 11, name: 'AirPods Pro 3', description: 'Chip H3, chống ồn chủ động, spatial audio', basePrice: 6990000, stockQuantity: 30, categoryId: 3, categoryName: 'Phụ kiện', unit: 'cái', specification: 'H3 chip, ANC, Spatial Audio, USB-C, IP54', productCode: 'APP3' },
  { id: 12, name: 'Samsung Galaxy Watch 7', description: 'Exynos W1000, theo dõi sức khỏe toàn diện', basePrice: 8990000, stockQuantity: 18, categoryId: 3, categoryName: 'Phụ kiện', unit: 'cái', specification: 'Exynos W1000, 2GB+32GB, BioActive Sensor, Wear OS', productCode: 'SGW7' },
  { id: 13, name: 'Bàn phím cơ Keychron Q3 Pro', description: 'Hot-swap, Bluetooth 5.1, keycap PBT', basePrice: 3290000, stockQuantity: 25, categoryId: 3, categoryName: 'Phụ kiện', unit: 'cái', specification: '87-key, Gateron Jupiter, BT 5.1, USB-C, QMK/VIA', productCode: 'KCQ3P' },
  { id: 14, name: 'Chuột Logitech G Pro X Superlight 2', description: 'Cảm biến HERO 2, 60g, 32000 DPI', basePrice: 3490000, stockQuantity: 22, categoryId: 3, categoryName: 'Phụ kiện', unit: 'cái', specification: 'HERO 2, 32K DPI, 60g, Lightspeed Wireless, USB-C', productCode: 'GPXS2' },
  { id: 15, name: 'Sạc dự phòng Anker 737', description: 'PowerCore 24K, 140W USB-C', basePrice: 2490000, stockQuantity: 35, categoryId: 3, categoryName: 'Phụ kiện', unit: 'cái', specification: '24,000mAh, 140W PD 3.1, 2x USB-C + USB-A', productCode: 'ANK737' },

  { id: 16, name: 'Sony WH-1000XM6', description: 'Chống ồn chủ động, LDAC, 40h pin', basePrice: 8990000, stockQuantity: 14, categoryId: 4, categoryName: 'Âm thanh', unit: 'cái', specification: 'ANC, LDAC, 40h, USB-C, Multipoint, 30mm driver', productCode: 'SONY1000XM6' },
  { id: 17, name: 'Marshall Stanmore III', description: 'Loa bluetooth 80W, âm thanh vòm', basePrice: 7990000, stockQuantity: 10, categoryId: 4, categoryName: 'Âm thanh', unit: 'cái', specification: '80W, BT 5.3, HDMI, RCA, 3.5mm, 30Hz-20kHz', productCode: 'MRSM3' },
  { id: 18, name: 'JBL PartyBox 320', description: 'Loa party 240W, đèn LED, karaoke', basePrice: 11990000, stockQuantity: 6, categoryId: 4, categoryName: 'Âm thanh', unit: 'cái', specification: '240W, BT 5.4, 18h, IPX4, Mic Input, Guitar Input', productCode: 'JBLPB320' },
  { id: 19, name: 'Bose QuietComfort Ultra Earbuds', description: 'Chống ồn, Spatial Audio, Immersive Audio', basePrice: 7990000, stockQuantity: 12, categoryId: 4, categoryName: 'Âm thanh', unit: 'cái', specification: 'ANC, Spatial Audio, CustomTune, IPX4, 6h+18h', productCode: 'BOSEQCE' },
  { id: 20, name: 'Sennheiser Momentum 4 Wireless', description: 'Chống ồn, aptX Adaptive, 60h pin', basePrice: 8490000, stockQuantity: 8, categoryId: 4, categoryName: 'Âm thanh', unit: 'cái', specification: 'ANC, aptX Adaptive, 60h, 42mm driver, USB-C', productCode: 'SENNM4' },

  { id: 21, name: 'Apple Watch Ultra 3', description: 'Chip S10, vỏ titanium 49mm, pin 36h', basePrice: 22990000, stockQuantity: 9, categoryId: 5, categoryName: 'Đồng hồ', unit: 'cái', specification: 'S10, 49mm Ti, 36h, GPS+LTE, WR100, EN13319', productCode: 'AWU3' },
  { id: 22, name: 'Garmin Fenix 8', description: 'Đa năng thể thao, AMOLED, bản đồ tích hợp', basePrice: 26990000, stockQuantity: 5, categoryId: 5, categoryName: 'Đồng hồ', unit: 'cái', specification: 'AMOLED 1.4", GPS, HRV, Topo Maps, 18 days', productCode: 'GRMF8' },
  { id: 23, name: 'Casio G-Shock GMW-B5000D', description: 'Full metal, solar, Bluetooth', basePrice: 15990000, stockQuantity: 11, categoryId: 5, categoryName: 'Đồng hồ', unit: 'cái', specification: 'Full Metal, Solar, BT, 200m WR, Tough Solar', productCode: 'CSGMWB' },
  { id: 24, name: 'Omega Speedmaster Moonwatch Professional', description: 'Lịch sử, sapphire, chronograph', basePrice: 189900000, stockQuantity: 2, categoryId: 5, categoryName: 'Đồng hồ', unit: 'cái', specification: '3861 Manual, 50h, Hesalite/Sapphire, 42mm, 100m', productCode: 'OMGSMP' },
  { id: 25, name: 'Rolex Submariner Date 126610LV', description: 'Kermit, ceramic bezel, 41mm', basePrice: 389900000, stockQuantity: 1, categoryId: 5, categoryName: 'Đồng hồ', unit: 'cái', specification: '3235 Automatic, 70h, Ceramic, 41mm, 300m WR', productCode: 'ROLSD' },

  { id: 26, name: 'iPad Pro M4 13 inch', description: 'Chip M4, màn hình Ultra Retina XDR OLED, 256GB', basePrice: 32990000, stockQuantity: 14, categoryId: 6, categoryName: 'Máy tính bảng', unit: 'cái', specification: 'M4, 256GB, 13" OLED, 8GB RAM, Thunderbolt 4', productCode: 'IPP13M4' },
  { id: 27, name: 'Samsung Galaxy Tab S10 Ultra', description: 'Snapdragon 8 Gen 3, màn hình 14.6 inch', basePrice: 29990000, stockQuantity: 8, categoryId: 6, categoryName: 'Máy tính bảng', unit: 'cái', specification: 'SD 8 Gen 3, 256GB, 14.6" AMOLED, 12GB RAM, S Pen', productCode: 'SGT10U' },
  { id: 28, name: 'Xiaomi Pad 7 Pro', description: 'Snapdragon 8+ Gen 2, 12.4 inch, 144Hz', basePrice: 15990000, stockQuantity: 20, categoryId: 6, categoryName: 'Máy tính bảng', unit: 'cái', specification: 'SD 8+ Gen 2, 256GB, 12.4" 144Hz, 8GB RAM', productCode: 'XMP7P' },
  { id: 29, name: 'iPad Air M3 11 inch', description: 'Chip M3, màn hình Liquid Retina 11 inch', basePrice: 21990000, stockQuantity: 16, categoryId: 6, categoryName: 'Máy tính bảng', unit: 'cái', specification: 'M3, 128GB, 11" Liquid Retina, 8GB RAM, Touch ID', productCode: 'IPA11M3' },
  { id: 30, name: 'Lenovo Tab Extreme', description: 'MediaTek Dimensity 9000, 14.5 inch OLED', basePrice: 19990000, stockQuantity: 7, categoryId: 6, categoryName: 'Máy tính bảng', unit: 'cái', specification: 'Dimensity 9000, 256GB, 14.5" OLED, 12GB RAM', productCode: 'LENTE' },

  { id: 31, name: 'TP-Link Deco XE75 Pro', description: 'Mesh WiFi 6E 3-pack, 5500Mbps', basePrice: 6990000, stockQuantity: 15, categoryId: 7, categoryName: 'Thiết bị mạng', unit: 'cái', specification: 'AXE5400, 3-pack, WiFi 6E, 2.5G Port, AI Mesh', productCode: 'TPLXE75' },
  { id: 32, name: 'Asus ROG Rapture GT-AXE16000', description: 'Router WiFi 6E, quad-band, 16000Mbps', basePrice: 15990000, stockQuantity: 4, categoryId: 7, categoryName: 'Thiết bị mạng', unit: 'cái', specification: 'Quad-band, 16Gbps, 2x 10G Port, VPN Fusion', productCode: 'ASUSGT' },
  { id: 33, name: 'Ubiquiti UniFi Dream Machine Pro', description: 'Gateway + NVR + Switch quản lý tập trung', basePrice: 12990000, stockQuantity: 6, categoryId: 7, categoryName: 'Thiết bị mạng', unit: 'cái', specification: 'UDM-Pro, 7x GbE, 2x 10G SFP+, 1x HDD Bay', productCode: 'UBUDMP' },
  { id: 34, name: 'MikroTik CCR2004-16G-2S+', description: 'Router cloud core 16 cổng, throughput 40Gbps', basePrice: 8990000, stockQuantity: 9, categoryId: 7, categoryName: 'Thiết bị mạng', unit: 'cái', specification: 'CCR2004, 16x GbE, 2x SFP+, RouterOS Level 6', productCode: 'MTCCR' },
  { id: 35, name: 'Google Nest WiFi Pro 6E', description: 'Mesh WiFi 6E 2-pack, 4200Mbps', basePrice: 7490000, stockQuantity: 12, categoryId: 7, categoryName: 'Thiết bị mạng', unit: 'cái', specification: 'AXE4200, 2-pack, WiFi 6E, Thread, Matter Hub', productCode: 'GNWP' },

  { id: 36, name: 'Sony A7R VI', description: 'Full-frame 61MP, AI autofocus, 8K video', basePrice: 74990000, stockQuantity: 3, categoryId: 8, categoryName: 'Camera', unit: 'cái', specification: '61MP FF, AI AF, 8K24p, IBIS 5.5EV, 759pt AF', productCode: 'SONYA7R6' },
  { id: 37, name: 'DJI Osmo Pocket 3', description: 'Gimbal camera 4K120p, 1-inch sensor', basePrice: 13990000, stockQuantity: 18, categoryId: 8, categoryName: 'Camera', unit: 'cái', specification: '1" CMOS, 4K120, 2" Rotatable Touchscreen', productCode: 'DJIOP3' },
  { id: 38, name: 'Canon EOS R5 Mark II', description: '45MP, 8K60p RAW, Eye Control AF', basePrice: 89990000, stockQuantity: 2, categoryId: 8, categoryName: 'Camera', unit: 'cái', specification: '45MP, 8K60 RAW, Eye Control, IBIS, CFexpress+SD', productCode: 'CANR5M2' },
  { id: 39, name: 'GoPro Hero 13 Black', description: '5.3K60, HyperSmooth 6.0, 10-bit HDR', basePrice: 11990000, stockQuantity: 20, categoryId: 8, categoryName: 'Camera', unit: 'cái', specification: '5.3K60, HyperSmooth 6, 10-bit, GPS, Waterproof 10m', productCode: 'GPH13' },
  { id: 40, name: 'Fujifilm X-T6', description: 'APS-C 40MP, film simulation, 6.2K video', basePrice: 35990000, stockQuantity: 5, categoryId: 8, categoryName: 'Camera', unit: 'cái', specification: '40MP APS-C, X-Trans VI, 6.2K30, Film Sims', productCode: 'FUJXT6' },
]

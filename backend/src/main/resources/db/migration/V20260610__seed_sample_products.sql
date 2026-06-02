-- ============================================================
-- Seed: Danh mục (Categories)
-- ============================================================
INSERT INTO categories (id, name) VALUES
  (1,  N'Thực phẩm & Đồ uống'),
  (2,  N'Hóa mỹ phẩm & Chăm sóc cá nhân'),
  (3,  N'Vật tư ngành may'),
  (4,  N'Thiết bị văn phòng'),
  (5,  N'Điện tử & Linh kiện'),
  (6,  N'Vật liệu xây dựng'),
  (7,  N'Bao bì & Đóng gói'),
  (8,  N'Thiết bị y tế'),
  (9,  N'Nông sản & Thực phẩm chức năng'),
  (10, N'Hóa chất công nghiệp')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Seed: Thương hiệu (Brands)
-- ============================================================
INSERT INTO brands (id, code, name) VALUES
  (1, 'VINAMILK',   N'Vinamilk'),
  (2, 'UNILEVER',   N'Unilever'),
  (3, 'SAMSUNG',    N'Samsung'),
  (4, 'XANH_ORGANIC', N'Xanh Organic'),
  (5, 'TOTO',       N'TOTO')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Seed: Sản phẩm (200 products)
-- ============================================================

-- === CATEGORY 1: Thực phẩm & Đồ uống (20 products, ids 1-20) ===
INSERT INTO products (id, name, category_id, base_price, stock_quantity, unit, brand_id, image_url) VALUES
  (1,  N'Sữa tươi Vinamilk 100% 1L',                   1, 32000,  500, N'Thùng', 1, 'https://via.placeholder.com/400x400.png?text=Vinamilk+Sua+tuoi'),
  (2,  N'Sữa chua uống Vinamilk 180ml',                1, 8000,   1200, N'Lốc', 1, 'https://via.placeholder.com/400x400.png?text=Sua+chua+Vinamilk'),
  (3,  N'Bột ngũ cốc Xanh Organic 500g',               1, 85000,  200, N'Gói', 4, 'https://via.placeholder.com/400x400.png?text=Ngu+coc+Xanh'),
  (4,  N'Cà phê rang xay nguyên chất 250g',            1, 65000,  300, N'Gói', NULL, 'https://via.placeholder.com/400x400.png?text=Ca+Phe+Rang+Xay'),
  (5,  N'Trà xanh túi lọc 100 túi',                    1, 45000,  400, N'Hộp', NULL, 'https://via.placeholder.com/400x400.png?text=Tra+Xanh+Loc'),
  (6,  N'Nước mắm Nam Ngư 500ml',                      1, 35000,  600, N'Chai', NULL, 'https://via.placeholder.com/400x400.png?text=Nuoc+Mam+Nam+Ngư'),
  (7,  N'Dầu ăn Tường An 1L',                          1, 42000,  500, N'Chai', NULL, 'https://via.placeholder.com/400x400.png?text=Dau+An+Tuong+An'),
  (8,  N'Gạo ST25 hữu cơ 5kg',                         1, 120000, 150, N'Bao', NULL, 'https://via.placeholder.com/400x400.png?text=Gao+ST25+5kg'),
  (9,  N'Mì gói Hảo Hảo 30 gói',                       1, 75000,  800, N'Thùng', NULL, 'https://via.placeholder.com/400x400.png?text=Mi+Hao+Hao'),
  (10, N'Nước ngọt Coca-Cola 330ml Lon',               1, 9000,   2000, N'Lon', NULL, 'https://via.placeholder.com/400x400.png?text=Coca+Cola+330'),
  (11, N'Sữa đặc Ông Thọ hộp 380g',                    1, 28000,  400, N'Hộp', NULL, 'https://via.placeholder.com/400x400.png?text=Sua+Ong+Tho'),
  (12, N'Bột mì đa dụng 1kg',                          1, 18000,  600, N'Gói', NULL, 'https://via.placeholder.com/400x400.png?text=Bot+Mi'),
  (13, N'Đường tinh luyện 1kg',                        1, 22000,  700, N'Gói', NULL, 'https://via.placeholder.com/400x400.png?text=Duong+Tinh+Luyen'),
  (14, N'Bia Tiger bạc 330ml',                         1, 12000,  1500, N'Lon', NULL, 'https://via.placeholder.com/400x400.png?text=Bia+Tiger+Bac'),
  (15, N'Sữa hạt hạnh nhân Xanh Organic 1L',           1, 48000,  250, N'Hộp', 4, 'https://via.placeholder.com/400x400.png?text=Sua+Hanh+Nhan'),
  (16, N'Snack khoai tây Lay s 40g',                   1, 6500,   3000, N'Gói', NULL, 'https://via.placeholder.com/400x400.png?text=Snack+Lays'),
  (17, N'Nước tương Tam Thái Tử 500ml',                1, 25000,  350, N'Chai', NULL, 'https://via.placeholder.com/400x400.png?text=Nuoc+Tuong'),
  (18, N'Bánh quy Oreo 97g',                           1, 12000,  500, N'Gói', NULL, 'https://via.placeholder.com/400x400.png?text=Banh+Oreo'),
  (19, N'Thạch rau câu Konnyaku 15 gói',               1, 22000,  400, N'Túi', NULL, 'https://via.placeholder.com/400x400.png?text=Konnyaku'),
  (20, N'Mật ong rừng nguyên chất 500ml',              1, 150000, 100, N'Chai', NULL, 'https://via.placeholder.com/400x400.png?text=Mat+Ong+Rung')
ON CONFLICT (id) DO NOTHING;

-- === CATEGORY 2: Hóa mỹ phẩm & Chăm sóc cá nhân (21-40) ===
INSERT INTO products (id, name, category_id, base_price, stock_quantity, unit, brand_id, image_url) VALUES
  (21, N'Sữa tắm Lifebuoy 900ml',                      2, 55000,  400, N'Chai', 2, 'https://via.placeholder.com/400x400.png?text=Lifebuoy'),
  (22, N'Dầu gội Clear 700ml',                         2, 85000,  350, N'Chai', 2, 'https://via.placeholder.com/400x400.png?text=Clear+Shampoo'),
  (23, N'Dầu xả Sunsilk 600ml',                        2, 72000,  300, N'Chai', 2, 'https://via.placeholder.com/400x400.png?text=Sunsilk'),
  (24, N'Kem đánh răng P/S 225g',                      2, 35000,  500, N'Tuýp', NULL, 'https://via.placeholder.com/400x400.png?text=PS'),
  (25, N'Sữa rửa mặt Cetaphil 500ml',                  2, 210000, 120, N'Chai', NULL, 'https://via.placeholder.com/400x400.png?text=Cetaphil'),
  (26, N'Nước hoa xịt phòng Glade 400ml',              2, 45000,  250, N'Bình', 2, 'https://via.placeholder.com/400x400.png?text=Glade'),
  (27, N'Băng vệ sinh Kotex 10 miếng',                 2, 28000,  600, N'Gói', NULL, 'https://via.placeholder.com/400x400.png?text=Kotex'),
  (28, N'Khăn giấy ướt Bobby 80 tờ',                   2, 18000,  800, N'Gói', NULL, 'https://via.placeholder.com/400x400.png?text=Bobby'),
  (29, N'Lăn khử mùi Rexona 50ml',                     2, 42000,  280, N'Chai', 2, 'https://via.placeholder.com/400x400.png?text=Rexona'),
  (30, N'Kem dưỡng da Vaseline 100ml',                 2, 65000,  200, N'Tuýp', 2, 'https://via.placeholder.com/400x400.png?text=Vaseline'),
  (31, N'Nước tẩy trang Bioderma 500ml',               2, 320000, 80,  N'Chai', NULL, 'https://via.placeholder.com/400x400.png?text=Bioderma'),
  (32, N'Xịt khoáng La Roche-Posay 150ml',             2, 180000, 90,  N'Chai', NULL, 'https://via.placeholder.com/400x400.png?text=LaRoche'),
  (33, N'Sáp vuốt tóc gatsby 80g',                     2, 55000,  220, N'Hộp', NULL, 'https://via.placeholder.com/400x400.png?text=Gatsby'),
  (34, N'Dao cạo râu Gillette 5 lưỡi',                 2, 95000,  180, N'Cây', NULL, 'https://via.placeholder.com/400x400.png?text=Gillette'),
  (35, N'Nước súc miệng Listerine 500ml',              2, 62000,  300, N'Chai', NULL, 'https://via.placeholder.com/400x400.png?text=Listerine'),
  (36, N'Kem chống nắng Anessa 60ml',                  2, 380000, 60,  N'Chai', NULL, 'https://via.placeholder.com/400x400.png?text=Anessa'),
  (37, N'Phấn phủ Innisfree',                          2, 250000, 70,  N'Hộp', NULL, 'https://via.placeholder.com/400x400.png?text=Innisfree'),
  (38, N'Son dưỡng ChapStick 4g',                      2, 15000,  500, N'Thỏi', NULL, 'https://via.placeholder.com/400x400.png?text=ChapStick'),
  (39, N'Kẹp tóc Nhật các loại (10 cái)',              2, 12000,  400, N'Gói', NULL, 'https://via.placeholder.com/400x400.png?text=Kep+Toc'),
  (40, N'Bộ cọ trang điểm 12 món',                     2, 85000,  150, N'Bộ', NULL, 'https://via.placeholder.com/400x400.png?text=Co+Trang+Diem')
ON CONFLICT (id) DO NOTHING;

-- === CATEGORY 3: Vật tư ngành may (41-60) ===
INSERT INTO products (id, name, category_id, base_price, stock_quantity, unit, image_url) VALUES
  (41, N'Chỉ may cotton 40/3 (cuộn 1000m)',             3, 15000,  1000, N'Cuộn', 'https://via.placeholder.com/400x400.png?text=Chi+May'),
  (42, N'Vải thun cotton 65/35 (mét)',                  3, 45000,  300,  N'Mét', 'https://via.placeholder.com/400x400.png?text=Vai+Thun'),
  (43, N'Vải kaki 8 sợi (mét)',                         3, 65000,  250,  N'Mét', 'https://via.placeholder.com/400x400.png?text=Vai+Kaki'),
  (44, N'Cúc nhựa 4 lỗ (100 cái)',                      3, 8000,   2000, N'Gói', 'https://via.placeholder.com/400x400.png?text=Cuc+Nhua'),
  (45, N'Dây kéo nhựa 20cm (10 cái)',                   3, 22000,  500,  N'Gói', 'https://via.placeholder.com/400x400.png?text=Day+Keo'),
  (46, N'Kim may tay các cỡ (20 cây)',                  3, 5000,   3000, N'Gói', 'https://via.placeholder.com/400x400.png?text=Kim+May'),
  (47, N'Thước dây 150cm',                               3, 8000,   400,  N'Cái', 'https://via.placeholder.com/400x400.png?text=Thuoc+Day'),
  (48, N'Kéo cắt vải 10inch',                            3, 35000,  200,  N'Cái', 'https://via.placeholder.com/400x400.png?text=Keo+Cat+Vai'),
  (49, N'Mếch vải không dệt (mét)',                      3, 12000,  500,  N'Mét', 'https://via.placeholder.com/400x400.png?text=Mech+Vai'),
  (50, N'Thun bản nhỏ 1cm (10m)',                        3, 10000,  600,  N'Cây', 'https://via.placeholder.com/400x400.png?text=Thun+Nho'),
  (51, N'Chun bản to 5cm (mét)',                         3, 15000,  400,  N'Mét', 'https://via.placeholder.com/400x400.png?text=Chun+Lon'),
  (52, N'Nhãn mác in sẵn (100 cái)',                     3, 25000,  300,  N'Gói', 'https://via.placeholder.com/400x400.png?text=Nhan+Mac'),
  (53, N'Bao nylon đựng quần áo 50x70 (100 cái)',        3, 35000,  250,  N'Bịch', 'https://via.placeholder.com/400x400.png?text=Bao+Nylon'),
  (54, N'Móc quần áo nhựa',                               3, 2000,   5000, N'Cái', 'https://via.placeholder.com/400x400.png?text=Moc+Quan+Ao'),
  (55, N'Ruy băng lụa 2cm (10m)',                        3, 18000,  350,  N'Cuộn', 'https://via.placeholder.com/400x400.png?text=Ruy+Bang'),
  (56, N'Đệm vai may mặc (10 đôi)',                      3, 12000,  400,  N'Gói', 'https://via.placeholder.com/400x400.png?text=Dem+Vai'),
  (57, N'Lót túi áo sơ mi (10 cái)',                     3, 15000,  300,  N'Gói', 'https://via.placeholder.com/400x400.png?text=Lot+Tui'),
  (58, N'Bàn là hơi nước cầm tay 1500W',                 3, 350000, 50,   N'Cái', 'https://via.placeholder.com/400x400.png?text=Ban+La'),
  (59, N'Máy vắt sổ Juki 2015',                          3, 8500000, 10,  N'Cái', 'https://via.placeholder.com/400x400.png?text=May+Vat+So'),
  (60, N'Đèn soi phát quang 40W',                        3, 120000, 80,   N'Cái', 'https://via.placeholder.com/400x400.png?text=Den+Soi')
ON CONFLICT (id) DO NOTHING;

-- === CATEGORY 4: Thiết bị văn phòng (61-80) ===
INSERT INTO products (id, name, category_id, base_price, stock_quantity, unit, image_url) VALUES
  (61, N'Giấy A4 Double A 70gsm (ream 500 tờ)',         4, 85000,  500, N'Ream', 'https://via.placeholder.com/400x400.png?text=Double+A'),
  (62, N'Mực in HP LaserJet 85A (CF285A)',              4, 450000, 60,  N'Hộp', 'https://via.placeholder.com/400x400.png?text=Muc+In+HP'),
  (63, N'Bút bi Thiên Long 031 (hộp 10 cây)',           4, 25000,  800, N'Hộp', 'https://via.placeholder.com/400x400.png?text=But+Bi+Thien+Long'),
  (64, N'Sổ tay bìa cứng A5 200 trang',                 4, 35000,  400, N'Cuốn', 'https://via.placeholder.com/400x400.png?text=So+Tay+A5'),
  (65, N'Bảng trắng 90x120cm + chân',                    4, 450000, 30,  N'Bộ', 'https://via.placeholder.com/400x400.png?text=Bang+Trang'),
  (66, N'Ghế xoay văn phòng cao cấp',                    4, 1800000, 15, N'Cái', 'https://via.placeholder.com/400x400.png?text=Ghe+Xoay'),
  (67, N'Bàn làm việc 1m2 x 0m6',                        4, 2500000, 10, N'Cái', 'https://via.placeholder.com/400x400.png?text=Ban+Lam+Viec'),
  (68, N'Máy in đa năng Canon MF449dw',                  4, 8500000, 5,  N'Cái', 'https://via.placeholder.com/400x400.png?text=Canon+MF449'),
  (69, N'Máy photocopy Ricoh 3554',                      4, 15000000,3,  N'Cái', 'https://via.placeholder.com/400x400.png?text=Ricoh+3554'),
  (70, N'Két sắt văn phòng 40L',                         4, 3200000, 8,  N'Cái', 'https://via.placeholder.com/400x400.png?text=Ket+Sat'),
  (71, N'Điện thoại bàn Panasonic KX-TS520',            4, 450000, 40,  N'Cái', 'https://via.placeholder.com/400x400.png?text=Dien+Thoai+Ban'),
  (72, N'Máy lọc nước nóng lạnh Kangaroo 3 vòi',        4, 5500000, 12, N'Cái', 'https://via.placeholder.com/400x400.png?text=Kangaroo'),
  (73, N'Quạt đứng Senko 55W',                           4, 350000, 50,  N'Cái', 'https://via.placeholder.com/400x400.png?text=Quat+Senko'),
  (74, N'Đèn bàn LED chống cận',                         4, 250000, 80,  N'Cái', 'https://via.placeholder.com/400x400.png?text=Den+Ban+LED'),
  (75, N'Máy chấm công vân tay Suprema',                 4, 3200000, 7,  N'Cái', 'https://via.placeholder.com/400x400.png?text=Suprema'),
  (76, N'Bìa hồ sơ thảo 3 dây (100 cái)',                4, 45000,  300, N'Bịch', 'https://via.placeholder.com/400x400.png?text=Bia+Ho+So'),
  (77, N'Bấm lỗ Deli 30 tờ',                             4, 85000,  100, N'Cái', 'https://via.placeholder.com/400x400.png?text=Bam+Lo+Deli'),
  (78, N'Máy tính Casio FX-580VN X',                     4, 320000, 60,  N'Cái', 'https://via.placeholder.com/400x400.png?text=Casio+580'),
  (79, N'Cặp tài liệu da A4',                            4, 120000, 200, N'Cái', 'https://via.placeholder.com/400x400.png?text=Cap+Tai+Lieu'),
  (80, N'Máy hủy giấy Fellowes 6 tờ',                    4, 850000, 25,  N'Cái', 'https://via.placeholder.com/400x400.png?text=Fellowes')
ON CONFLICT (id) DO NOTHING;

-- === CATEGORY 5: Điện tử & Linh kiện (81-100) ===
INSERT INTO products (id, name, category_id, base_price, stock_quantity, unit, brand_id, image_url) VALUES
  (81, N'Điện thoại Samsung Galaxy S25 256GB',          5, 18990000, 20, N'Cái', 3, 'https://via.placeholder.com/400x400.png?text=Galaxy+S25'),
  (82, N'Màn hình Samsung 27inch 4K',                    5, 8500000,  15, N'Cái', 3, 'https://via.placeholder.com/400x400.png?text=Man+Hinh+Samsung'),
  (83, N'Laptop Dell Inspiron 3520 i5',                  5, 15500000, 12, N'Cái', NULL, 'https://via.placeholder.com/400x400.png?text=Dell+Inspiron'),
  (84, N'Chuột không dây Logitech M585',                5, 450000,   80, N'Cái', NULL, 'https://via.placeholder.com/400x400.png?text=Logitech+M585'),
  (85, N'Bàn phím cơ E-DRA EK381',                      5, 550000,   40, N'Cái', NULL, 'https://via.placeholder.com/400x400.png?text=E-DRA+EK381'),
  (86, N'USB 3.0 SanDisk 64GB',                         5, 180000,   200, N'Cái', NULL, 'https://via.placeholder.com/400x400.png?text=SanDisk+64GB'),
  (87, N'Ổ cứng SSD Samsung 1TB',                       5, 3200000,  30, N'Cái', 3, 'https://via.placeholder.com/400x400.png?text=SSD+Samsung+1TB'),
  (88, N'RAM DDR4 16GB Kingston',                       5, 850000,   50, N'Cây', NULL, 'https://via.placeholder.com/400x400.png?text=Kingston+16GB'),
  (89, N'Router WiFi TP-Link AX3000',                    5, 650000,   35, N'Cái', NULL, 'https://via.placeholder.com/400x400.png?text=TP-Link+AX3000'),
  (90, N'Pin sạc dự phòng 20000mAh',                    5, 350000,   100, N'Cái', NULL, 'https://via.placeholder.com/400x400.png?text=Pin+Du+Phong'),
  (91, N'Cáp sạc Type-C 1m',                            5, 50000,    500, N'Cái', NULL, 'https://via.placeholder.com/400x400.png?text=Type-C+1m'),
  (92, N'Tai nghe Bluetooth Samsung Buds3',             5, 2500000,  25, N'Cái', 3, 'https://via.placeholder.com/400x400.png?text=Buds3'),
  (93, N'Máy ảnh Canon EOS R50 kit 18-45',              5, 22000000, 5,  N'Cái', NULL, 'https://via.placeholder.com/400x400.png?text=Canon+R50'),
  (94, N'Loa Bluetooth JBL Flip 6',                      5, 3500000,  18, N'Cái', NULL, 'https://via.placeholder.com/400x400.png?text=JBL+Flip6'),
  (95, N'Smartwatch Samsung Watch7',                     5, 8500000,  15, N'Cái', 3, 'https://via.placeholder.com/400x400.png?text=Watch7'),
  (96, N'Máy tính bảng iPad Gen 10 64GB',               5, 10990000, 10, N'Cái', NULL, 'https://via.placeholder.com/400x400.png?text=iPad+Gen10'),
  (97, N'Webcam Logitech C920 HD',                       5, 1200000,  30, N'Cái', NULL, 'https://via.placeholder.com/400x400.png?text=Logitech+C920'),
  (98, N'Máy chiếu Epson EB-FH52 4000lm',               5, 18500000, 4,  N'Cái', NULL, 'https://via.placeholder.com/400x400.png?text=Epson+FH52'),
  (99, N'Dây HDMI 2m 8K',                                5, 120000,   150, N'Cái', NULL, 'https://via.placeholder.com/400x400.png?text=HDMI+2m'),
  (100,N'Micro không dây Shure BLX288',                  5, 6500000,  6,  N'Cái', NULL, 'https://via.placeholder.com/400x400.png?text=Shure+BLX')
ON CONFLICT (id) DO NOTHING;

-- === CATEGORY 6: Vật liệu xây dựng (101-120) ===
INSERT INTO products (id, name, category_id, base_price, stock_quantity, unit, image_url) VALUES
  (101,N'Xi măng Holcim PCB40 (bao 50kg)',               6, 85000,   500, N'Bao', 'https://via.placeholder.com/400x400.png?text=Xi+Mang+Holcim'),
  (102,N'Sắt phi 10 (cây 11.7m)',                        6, 95000,   300, N'Cây', 'https://via.placeholder.com/400x400.png?text=Sat+Phi+10'),
  (103,N'Cát xây dựng hạt vàng (m3)',                    6, 280000,  100, N'M3', 'https://via.placeholder.com/400x400.png?text=Cat+Xay+Dung'),
  (104,N'Đá 1x2 (m3)',                                    6, 320000,  80,  N'M3', 'https://via.placeholder.com/400x400.png?text=Da+1x2'),
  (105,N'Gạch ống 4 lỗ (viên)',                          6, 2500,    10000, N'Viên', 'https://via.placeholder.com/400x400.png?text=Gach+4lo'),
  (106,N'Gạch men 60x60cm',                               6, 85000,   400, N'M2', 'https://via.placeholder.com/400x400.png?text=Gach+Men'),
  (107,N'Sơn nước Jotun nội thất 5L',                    6, 350000,  60,  N'Thùng', 'https://via.placeholder.com/400x400.png?text=Jotun+Noi+That'),
  (108,N'Sơn dầu Hammerite 1L',                           6, 180000,  40,  N'Lon', 'https://via.placeholder.com/400x400.png?text=Hammerite'),
  (109,N'Thép hộp 40x80 (cây 6m)',                       6, 210000,  200, N'Cây', 'https://via.placeholder.com/400x400.png?text=Thep+Hop'),
  (110,N'Tôn lợp mái 11 sóng (tấm 2.4m)',                6, 95000,   500, N'Tấm', 'https://via.placeholder.com/400x400.png?text=Ton+Lop+Mai'),
  (111,N'Ống nhựa PVC D60 (cây 4m)',                     6, 45000,   300, N'Cây', 'https://via.placeholder.com/400x400.png?text=ONg+PVC'),
  (112,N'Dây điện Cadivi 2.5mm (m)',                      6, 12000,   2000, N'Mét', 'https://via.placeholder.com/400x400.png?text=Cadivi+2.5'),
  (113,N'Bột trét tường Jotun 40kg',                     6, 180000,  50,  N'Bao', 'https://via.placeholder.com/400x400.png?text=Bot+Tret+Tuong'),
  (114,N'Keo dán gạch đá (thùng 20kg)',                  6, 220000,  30,  N'Thùng', 'https://via.placeholder.com/400x400.png?text=Keo+Dan+Gach'),
  (115,N'Thiết bị vệ sinh TOTO 1 khối',                  6, 5500000, 8,   N'Bộ', 'https://via.placeholder.com/400x400.png?text=TOTO+Ve+Sinh'),
  (116,N'Bồn rửa chén Inox 1 hố',                         6, 1800000, 12,  N'Cái', 'https://via.placeholder.com/400x400.png?text=Bon+Rua+Chen'),
  (117,N'Máy nước nóng NL Solar 200L',                   6, 8500000, 5,   N'Cái', 'https://via.placeholder.com/400x400.png?text=Nuoc+Nong+NL'),
  (118,N'Cửa nhôm kính Việt Pháp (m2)',                  6, 1500000, 20,  N'M2', 'https://via.placeholder.com/400x400.png?text=Cua+Nhom+VP'),
  (119,N'Lưới B40 khổ 1m (mét dài)',                     6, 35000,   400, N'Mét', 'https://via.placeholder.com/400x400.png?text=Luoi+B40'),
  (120,N'Đá ốp lát Granite cao cấp (m2)',               6, 1200000, 15,  N'M2', 'https://via.placeholder.com/400x400.png?text=Granite')
ON CONFLICT (id) DO NOTHING;

-- === CATEGORY 7: Bao bì & Đóng gói (121-140) ===
INSERT INTO products (id, name, category_id, base_price, stock_quantity, unit, image_url) VALUES
  (121,N'Thùng carton 3 lớp 50x40x30',                   7, 8500,    2000, N'Cái', 'https://via.placeholder.com/400x400.png?text=Thung+Carton'),
  (122,N'Băng keo trong 5cm x 100m',                    7, 12000,   800,  N'Cuộn', 'https://via.placeholder.com/400x400.png?text=Bang+Keo+Trong'),
  (123,N'Băng keo nâu 5cm x 100m',                      7, 10000,   1000, N'Cuộn', 'https://via.placeholder.com/400x400.png?text=Bang+Keo+Nau'),
  (124,N'Màng PE co rút 30cm (kg)',                      7, 35000,   300,  N'Kg', 'https://via.placeholder.com/400x400.png?text=Mang+PE+Co'),
  (125,N'Màng bọc thực phẩm PVC 30cm (kg)',             7, 28000,   250,  N'Kg', 'https://via.placeholder.com/400x400.png?text=Mang+Boc'),
  (126,N'Túi nilon đựng hàng 30x45 (kg)',                7, 25000,   400,  N'Kg', 'https://via.placeholder.com/400x400.png?text=Tui+Nilon'),
  (127,N'Dây đai nhựa PP 12mm (kg)',                     7, 22000,   500,  N'Kg', 'https://via.placeholder.com/400x400.png?text=Day+Dai+PP'),
  (128,N'Máy quấn màng PE cầm tay',                      7, 650000,  20,   N'Cái', 'https://via.placeholder.com/400x400.png?text=May+Quan+PE'),
  (129,N'Súng bắn ghim đóng thùng',                      7, 180000,  30,   N'Cái', 'https://via.placeholder.com/400x400.png?text=Sung+Ban+Ghim'),
  (130,N'Ghim nhựa đóng thùng (1000 cái)',               7, 25000,   300,  N'Túi', 'https://via.placeholder.com/400x400.png?text=Ghim+Đong+Thung'),
  (131,N'Nhãn dán phân loại 10x15 (1000 tem)',           7, 45000,   200,  N'Cuộn', 'https://via.placeholder.com/400x400.png?text=Nhan+Dan'),
  (132,N'Sticker cảnh báo dễ vỡ (500 cái)',             7, 35000,   150,  N'Cuộn', 'https://via.placeholder.com/400x400.png?text=Sticker'),
  (133,N'Mút xốp bảo vệ (tấm 1m x 2m x 5cm)',           7, 25000,   200,  N'Tấm', 'https://via.placeholder.com/400x400.png?text=Mut+Xop'),
  (134,N'Bìa carton 5 lớp 60x80cm',                      7, 15000,   1000, N'Tấm', 'https://via.placeholder.com/400x400.png?text=Bia+Carton'),
  (135,N'Dây chun đóng hàng (kg)',                       7, 18000,   400,  N'Kg', 'https://via.placeholder.com/400x400.png?text=Day+Chun'),
  (136,N'Máy dán băng keo tự động',                      7, 3500000, 5,    N'Cái', 'https://via.placeholder.com/400x400.png?text=May+Dan+Keo'),
  (137,N'Cân bàn điện tử 30kg',                          7, 850000,  10,   N'Cái', 'https://via.placeholder.com/400x400.png?text=Can+Ban'),
  (138,N'Máy in mã vạch TSC TTP-244',                    7, 4200000, 6,    N'Cái', 'https://via.placeholder.com/400x400.png?text=TSC+TTP244'),
  (139,N'Máy dập khung carton thủ công',                 7, 2800000, 4,    N'Cái', 'https://via.placeholder.com/400x400.png?text=May+Dap+Carton'),
  (140,N'Túi hút chân không 25x35 (100 cái)',            7, 35000,   150,  N'Túi', 'https://via.placeholder.com/400x400.png?text=Tui+Hut+Chan+Không')
ON CONFLICT (id) DO NOTHING;

-- === CATEGORY 8: Thiết bị y tế (141-160) ===
INSERT INTO products (id, name, category_id, base_price, stock_quantity, unit, image_url) VALUES
  (141,N'Khẩu trang y tế 4 lớp (hộp 50 cái)',           8, 25000,   2000, N'Hộp', 'https://via.placeholder.com/400x400.png?text=Khau+Trang'),
  (142,N'Găng tay y tế Nitrile size M (hộp 100 cái)',   8, 85000,   300,  N'Hộp', 'https://via.placeholder.com/400x400.png?text=Gang+Tay'),
  (143,N'Nhiệt kế điện tử hồng ngoại',                  8, 350000,  50,   N'Cái', 'https://via.placeholder.com/400x400.png?text=Nhiet+Ke'),
  (144,N'Máy đo huyết áp bắp tay Omron',                8, 850000,  25,   N'Cái', 'https://via.placeholder.com/400x400.png?text=Omron'),
  (145,N'Máy đo đường huyết Accu-Chek',                 8, 450000,  30,   N'Cái', 'https://via.placeholder.com/400x400.png?text=AccuChek'),
  (146,N'Que thử đường huyết (50 que)',                 8, 280000,  60,   N'Hộp', 'https://via.placeholder.com/400x400.png?text=Que+Thu'),
  (147,N'Bông y tế hộp 100g',                            8, 15000,   500,  N'Hộp', 'https://via.placeholder.com/400x400.png?text=Bong+Y+Te'),
  (148,N'Băng gạc y tế 10cm x 5m',                      8, 8000,    1000, N'Túi', 'https://via.placeholder.com/400x400.png?text=Bang+Gac'),
  (149,N'Dung dịch sát khuẩn tay 500ml',                 8, 35000,   400,  N'Chai', 'https://via.placeholder.com/400x400.png?text=Sat+Khuẩn'),
  (150,N'Máy xông mũi họng OMRON NE-C28',              8, 850000,  15,   N'Cái', 'https://via.placeholder.com/400x400.png?text=May+Xong'),
  (151,N'Bình oxy y tế 5L kèm đồng hồ',                 8, 2500000, 8,    N'Bộ', 'https://via.placeholder.com/400x400.png?text=Binh+Oxy'),
  (152,N'Nạng gấp Inox',                                  8, 350000,  20,   N'Cặp', 'https://via.placeholder.com/400x400.png?text=Nang+Gap'),
  (153,N'Xe lăn tay thép không gỉ',                      8, 2500000, 5,    N'Cái', 'https://via.placeholder.com/400x400.png?text=Xe+Lan'),
  (154,N'Đèn đáy mạ đỏ 50ml',                            8, 12000,   500,  N'Chai', 'https://via.placeholder.com/400x400.png?text=Den+Day+Ma'),
  (155,N'Vitamin C 500mg (hộp 100 viên)',                8, 65000,   200,  N'Hộp', 'https://via.placeholder.com/400x400.png?text=Vitamin+C'),
  (156,N'Canxi + D3 (hộp 60 viên)',                      8, 85000,   150,  N'Hộp', 'https://via.placeholder.com/400x400.png?text=Canxi+D3'),
  (157,N'Máy massage cầm tay cao cấp',                   8, 550000,  20,   N'Cái', 'https://via.placeholder.com/400x400.png?text=May+Massage'),
  (158,N'Ghế massage toàn thân',                         8, 15000000,3,    N'Cái', 'https://via.placeholder.com/400x400.png?text=Ghe+Massage'),
  (159,N'Đai nẹp lưng y tế',                             8, 180000,  40,   N'Cái', 'https://via.placeholder.com/400x400.png?text=Dai+Nep+Lung'),
  (160,N'Nồi hấp tiệt trùng 8L',                         8, 3500000, 5,    N'Cái', 'https://via.placeholder.com/400x400.png?text=Noi+Hap')
ON CONFLICT (id) DO NOTHING;

-- === CATEGORY 9: Nông sản & Thực phẩm chức năng (161-180) ===
INSERT INTO products (id, name, category_id, base_price, stock_quantity, unit, image_url) VALUES
  (161,N'Yến sào tinh chế Khánh Hòa 100g',              9, 2500000, 20,  N'Hộp', 'https://via.placeholder.com/400x400.png?text=Yen+Sao+KH'),
  (162,N'Nhân sâm Hàn Quốc 6 năm tuổi (hộp 75g)',      9, 3500000, 8,   N'Hộp', 'https://via.placeholder.com/400x400.png?text=Nhan+Sam'),
  (163,N'Nấm linh chi đỏ 500g',                          9, 850000,  15,  N'Hộp', 'https://via.placeholder.com/400x400.png?text=Linh+Chi'),
  (164,N'Đông trùng hạ thảo viên nang (60 viên)',       9, 1200000, 12,  N'Hộp', 'https://via.placeholder.com/400x400.png?text=Dong+Trung+Ha+Thao'),
  (165,N'Tảo xoắn Spirulina 500mg (200 viên)',          9, 280000,  30,  N'Hộp', 'https://via.placeholder.com/400x400.png?text=Tao+Xoan'),
  (166,N'Dầu cá Omega-3 1000mg (100 viên)',             9, 180000,  40,  N'Chai', 'https://via.placeholder.com/400x400.png?text=Omega3'),
  (167,N'Tinh dầu thông đỏ (hộp 50ml)',                 9, 250000,  25,  N'Hộp', 'https://via.placeholder.com/400x400.png?text=Tinh+Dau+Thong'),
  (168,N'Bột protein Whey 2kg (socola)',                 9, 650000,  15,  N'Bao', 'https://via.placeholder.com/400x400.png?text=Whey+Protein'),
  (169,N'Gạo lứt huyết rồng hữu cơ 2kg',                 9, 55000,   200, N'Bao', 'https://via.placeholder.com/400x400.png?text=Gao+Lu'),
  (170,N'Cà phê sạch Arabica Đà Lạt 500g',              9, 120000,  60,  N'Gói', 'https://via.placeholder.com/400x400.png?text=Arabica+Da+Lat'),
  (171,N'Hạt điều rang muối 500g',                       9, 85000,   100, N'Bao', 'https://via.placeholder.com/400x400.png?text=Hat+Dieu'),
  (172,N'Hạt macca rang bơ 500g',                        9, 120000,  80,  N'Bao', 'https://via.placeholder.com/400x400.png?text=Macca'),
  (173,N'Trà atiso túi lọc (100 túi)',                   9, 55000,   150, N'Hộp', 'https://via.placeholder.com/400x400.png?text=Tra+Atiso'),
  (174,N'Bột nghệ nguyên chất 500g',                     9, 45000,   120, N'Bao', 'https://via.placeholder.com/400x400.png?text=Bot+Nghe'),
  (175,N'Viên uống Glucosamine 1500mg (60 viên)',       9, 320000,  35,  N'Hộp', 'https://via.placeholder.com/400x400.png?text=Glucosamine'),
  (176,N'Collagen Peptide làm đẹp 200g',                 9, 280000,  25,  N'Hộp', 'https://via.placeholder.com/400x400.png?text=Collagen'),
  (177,N'Nước ép lựu đen nguyên chất 1L',               9, 85000,   40,  N'Chai', 'https://via.placeholder.com/400x400.png?text=Nuoc+Ep+Luu'),
  (178,N'Macca sấy giòn (gói 200g)',                     9, 65000,   90,  N'Gói', 'https://via.placeholder.com/400x400.png?text=Macca+Sấy'),
  (179,N'Bánh gạo lứt sâm (10 gói)',                     9, 35000,   200, N'Túi', 'https://via.placeholder.com/400x400.png?text=Banh+Gao+Lu'),
  (180,N'Trà gừng mật ong (20 gói)',                     9, 45000,   150, N'Hộp', 'https://via.placeholder.com/400x400.png?text=Tra+Gung')
ON CONFLICT (id) DO NOTHING;

-- === CATEGORY 10: Hóa chất công nghiệp (181-200) ===
INSERT INTO products (id, name, category_id, base_price, stock_quantity, unit, image_url) VALUES
  (181,N'Javen xút tẩy 30L',                             10, 85000,   40,  N'Can', 'https://via.placeholder.com/400x400.png?text=Javen+Xut'),
  (182,N'Axít H2SO4 98% (20L)',                          10, 350000,  15,  N'Can', 'https://via.placeholder.com/400x400.png?text=H2SO4+98'),
  (183,N'NaOH rắn 99% (25kg bao)',                       10, 280000,  30,  N'Bao', 'https://via.placeholder.com/400x400.png?text=NaOH+99'),
  (184,N'Chất tẩy rửa công nghiệp 20L',                  10, 180000,  25,  N'Can', 'https://via.placeholder.com/400x400.png?text=Tay+Rua+CN'),
  (185,N'Dầu DO Diesel (lít)',                           10, 22000,   500, N'Lít', 'https://via.placeholder.com/400x400.png?text=Dau+DO'),
  (186,N'Nhớt động cơ 15W-40 (5L)',                      10, 250000,  60,  N'Can', 'https://via.placeholder.com/400x400.png?text=Nhot+Dong+Co'),
  (187,N'Keo dán công nghiệp 502 (chai 100ml)',          10, 15000,   500, N'Chai', 'https://via.placeholder.com/400x400.png?text=Keo+502'),
  (188,N'Phụ gia xử lý nước thải 25kg',                 10, 450000,  10,  N'Bao', 'https://via.placeholder.com/400x400.png?text=Xu+Ly+Nuoc'),
  (189,N'Clo bột khử trùng 70% (20kg)',                 10, 380000,  12,  N'Thùng', 'https://via.placeholder.com/400x400.png?text=Clo+Khu+Trung'),
  (190,N'Hàn the (Borax) 25kg bao',                      10, 320000,  20,  N'Bao', 'https://via.placeholder.com/400x400.png?text=Han+The'),
  (191,N'KMnO4 kali permanganat 500g',                   10, 85000,   35,  N'Chai', 'https://via.placeholder.com/400x400.png?text=KMnO4'),
  (192,N'Dung môi Acetone 20L',                          10, 480000,  8,   N'Can', 'https://via.placeholder.com/400x400.png?text=Acetone'),
  (193,N'Cồn Ethanol 96° (20L)',                         10, 280000,  25,  N'Can', 'https://via.placeholder.com/400x400.png?text=Ethanol+96'),
  (194,N'Phân bón NPK 20-20-15 (bao 50kg)',              10, 350000,  50,  N'Bao', 'https://via.placeholder.com/400x400.png?text=NPK+202015'),
  (195,N'Thuốc trừ sâu sinh học 1L',                     10, 180000,  20,  N'Chai', 'https://via.placeholder.com/400x400.png?text=Thuoc+Tru+Sau'),
  (196,N'Keo silicon trung tính trắng 280ml',            10, 25000,   200, N'Ống', 'https://via.placeholder.com/400x400.png?text=Keo+Silicon'),
  (197,N'Sáp đánh bóng công nghiệp 5kg',                 10, 220000,  15,  N'Hộp', 'https://via.placeholder.com/400x400.png?text=Sap+Danh+Bong'),
  (198,N'Dầu chống gỉ WD-40 (lon 400ml)',                10, 55000,   80,  N'Lon', 'https://via.placeholder.com/400x400.png?text=WD+40'),
  (199,N'Bột màu công nghiệp đen (25kg)',                10, 500000,  5,   N'Bao', 'https://via.placeholder.com/400x400.png?text=Bot+Mau+CN'),
  (200,N'Dung dịch vệ sinh công nghiệp 5L',              10, 120000,  60,  N'Can', 'https://via.placeholder.com/400x400.png?text=Ve+Sinh+CN')
ON CONFLICT (id) DO NOTHING;

-- Reset sequence để id tăng tiếp sau 200
SELECT setval('products_id_seq', 200);
SELECT setval('categories_id_seq', 10);
SELECT setval('brands_id_seq', 5);

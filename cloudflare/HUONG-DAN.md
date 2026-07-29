# Cài máy chủ nhận lời chúc & xác nhận tham dự

Làm một lần, khoảng 20 phút. **Không cần cài gì lên máy**, làm hết trên web.
Không cần tài khoản Google — đăng ký Cloudflare bằng email bất kỳ.

Kết quả: lời chúc của khách được lưu lại và hiện lên thiệp cho mọi người cùng xem.
Khách **không phải đăng nhập** gì cả.

---

## Bước 1 — Tạo tài khoản Cloudflare

1. Vào https://dash.cloudflare.com/sign-up
2. Đăng ký bằng email, xác nhận email.
3. Không cần thêm tên miền, không cần nhập thẻ.

## Bước 2 — Tạo database D1

1. Trong bảng điều khiển, menu trái chọn **Storage & Databases → D1 SQL Database**
2. Bấm **Create database**
3. Tên: `thiep-cuoi` → **Create**
4. Vào tab **Console** của database vừa tạo
5. Mở file `schema.sql` trong thư mục này, copy **toàn bộ** nội dung, dán vào ô Console rồi bấm **Execute**

   Chạy xong sẽ thấy 2 bảng `wishes` và `rsvp` ở tab **Tables**.

## Bước 3 — Tạo Worker

1. Menu trái chọn **Compute (Workers) → Workers & Pages**
2. Bấm **Create** → chọn **Start with Hello World!** → **Get started**
3. Tên Worker: `thiep-cuoi-api` → **Deploy**
4. Deploy xong bấm **Edit code** (hoặc **</> Edit code**)
5. Xoá hết code mẫu trong khung soạn thảo
6. Mở file `worker.js` trong thư mục này, copy **toàn bộ** nội dung, dán vào
7. Bấm **Deploy**

## Bước 4 — Nối Worker với database

1. Quay lại trang Worker `thiep-cuoi-api`
2. Vào tab **Settings** → mục **Bindings** → **Add** → chọn **D1 database**
3. Điền:
   - **Variable name**: `DB`  ← phải viết hoa đúng như vậy
   - **D1 database**: chọn `thiep-cuoi`
4. **Deploy** lại

> Bỏ qua bước này thì API sẽ luôn báo "Lỗi máy chủ".

## Bước 5 — Lấy địa chỉ Worker

Ở trang Worker, mục **Domains & Routes**, bạn thấy địa chỉ dạng:

```
https://thiep-cuoi-api.<tên-tài-khoản>.workers.dev
```

Copy địa chỉ này.

## Bước 6 — Dán vào thiệp

Mở `asset/js/00-config.js`, điền địa chỉ vừa copy:

```js
window.MIU_API_BASE = 'https://thiep-cuoi-api.abc123.workers.dev';
```

Lưu lại, commit và push. Xong.

---

## Kiểm tra

Mở địa chỉ này trên trình duyệt (thay bằng địa chỉ Worker của bạn):

```
https://thiep-cuoi-api.abc123.workers.dev/api/invitations/slug/duc-thai-thu-hien-2026-05-24/wishes
```

Đúng thì trả về:

```json
{"success":true,"data":[]}
```

- Trả về `{"success":false,"error":"Lỗi máy chủ..."}` → chưa làm Bước 4 (binding `DB`)
- Trả về `{"success":false,"error":"Không tìm thấy"}` → sai đường dẫn, kiểm tra lại slug

---

## Xem lời chúc khách đã gửi

Vào **D1 SQL Database → thiep-cuoi → Console**, chạy:

```sql
SELECT created_at, fullname, comment FROM wishes ORDER BY id DESC;
```

Xem danh sách xác nhận tham dự:

```sql
SELECT created_at, guest_name, will_attend, number_of_guests, message
FROM rsvp ORDER BY id DESC;
```

## Xoá một lời chúc không phù hợp

```sql
DELETE FROM wishes WHERE id = 12;
```

## Muốn duyệt trước khi lời chúc hiện lên

Trong `worker.js`, tìm dòng:

```js
'VALUES (?1, ?2, ?3, 1, ?4)'
```

đổi số `1` thành `0`, rồi Deploy lại. Từ đó lời chúc mới gửi sẽ ở trạng thái chờ.
Khi muốn cho hiện, chạy trong Console:

```sql
UPDATE wishes SET approved = 1 WHERE id = 12;   -- cho hiện 1 lời chúc
UPDATE wishes SET approved = 1;                 -- cho hiện tất cả
```

---

## Ghi chú

- **Miễn phí**: 100.000 lượt gọi/ngày, 5 triệu dòng đọc/ngày. Một đám cưới dùng
  không tới 1% mức này.
- **Không bị ngủ**: Worker luôn sẵn sàng, khác với gói miễn phí của một số dịch vụ khác.
- **Chỉ thiệp của bạn gọi được**: trong `worker.js` có danh sách `ALLOWED` giới hạn
  địa chỉ được phép. Đang cho phép sẵn GitHub Pages, mọi tên miền `*.vercel.app`
  (kể cả bản xem trước Vercel tự sinh), và localhost.

  Nếu dùng tên miền riêng, thêm vào danh sách rồi Deploy lại Worker:

  ```js
  const ALLOWED = [
    'https://tuna-98.github.io',
    '*.vercel.app',
    'https://ten-mien-cua-ban.com',   // <- thêm dòng này
    'http://localhost',
    'http://127.0.0.1',
  ];
  ```

  **Quan trọng**: mỗi lần sửa `worker.js` phải dán lại vào Cloudflare và bấm
  Deploy, sửa file trên máy thôi thì Worker vẫn chạy code cũ.
- **Slug**: thiệp đang dùng `duc-thai-thu-hien-2026-05-24` (lấy từ thuộc tính
  `data-slug` trong `index.html`). Đổi slug thì dữ liệu cũ vẫn còn nhưng thiệp
  sẽ không đọc ra nữa, vì mỗi slug là một sổ riêng.

/**
 * Địa chỉ API nhận lời chúc và xác nhận tham dự.
 *
 * Sau khi deploy Cloudflare Worker (xem cloudflare/HUONG-DAN.md), dán URL
 * Worker vào đây. Ví dụ: 'https://thiep-cuoi-api.tuna-98.workers.dev'
 *
 * Để trống '' thì thiệp vẫn chạy bình thường, chỉ riêng phần Sổ lưu bút và
 * Xác nhận tham dự sẽ báo "Chưa cấu hình máy chủ" thay vì lỗi khó hiểu.
 */
window.MIU_API_BASE = 'https://crimson-sun-6f97.tuannguyentk298.workers.dev';

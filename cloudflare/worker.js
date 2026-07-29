/**
 * Cloudflare Worker - API cho thiệp cưới Mạnh Lâm & Nguyễn Thảo
 *
 * Nhận và trả về:
 *   GET  /api/invitations/slug/<slug>/wishes  -> danh sách lời chúc
 *   POST /api/invitations/slug/<slug>/wishes  -> thêm lời chúc
 *   POST /api/invitations/slug/<slug>/rsvp    -> xác nhận tham dự
 *
 * Cần một D1 database gắn với biến DB (xem HUONG-DAN.md).
 */

// Chỉ cho phép các địa chỉ này gọi API. Thêm tên miền của bạn vào đây nếu đổi.
const ALLOWED = [
  'https://tuna-98.github.io',
  'http://localhost',
  'http://127.0.0.1',
];

const MAX_NAME = 80;
const MAX_TEXT = 1000;
const MAX_LIST = 500;

function corsHeaders(origin) {
  // Mở thiệp bằng file:// thì trình duyệt gửi Origin: null -> vẫn cho qua
  const ok =
    !origin ||
    origin === 'null' ||
    ALLOWED.some((a) => origin === a || origin.startsWith(a + ':'));
  return {
    'Access-Control-Allow-Origin': ok ? origin || '*' : ALLOWED[0],
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function json(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders(origin),
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

function clean(v, max) {
  return String(v == null ? '' : v)
    .replace(/[\u0000-\u001F\u007F]/g, '') // bỏ ký tự điều khiển
    .trim()
    .slice(0, max);
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin');

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    const url = new URL(request.url);
    const route = url.pathname.match(
      /^\/api\/invitations\/slug\/([^/]+)\/(wishes|rsvp)\/?$/
    );
    if (!route) {
      return json({ success: false, error: 'Không tìm thấy' }, 404, origin);
    }

    const slug = decodeURIComponent(route[1]);
    const kind = route[2];

    let body = {};
    if (request.method === 'POST') {
      try {
        body = await request.json();
      } catch (e) {
        return json({ success: false, error: 'Dữ liệu không hợp lệ' }, 400, origin);
      }
      if (!body || typeof body !== 'object') {
        return json({ success: false, error: 'Dữ liệu không hợp lệ' }, 400, origin);
      }
    }

    try {
      // ----- Lấy danh sách lời chúc -----
      if (kind === 'wishes' && request.method === 'GET') {
        const { results } = await env.DB.prepare(
          'SELECT fullname, comment, created_at AS createdAt FROM wishes ' +
            'WHERE slug = ?1 AND approved = 1 ORDER BY id DESC LIMIT ?2'
        )
          .bind(slug, MAX_LIST)
          .all();
        return json({ success: true, data: results || [] }, 200, origin);
      }

      // ----- Gửi lời chúc mới -----
      if (kind === 'wishes' && request.method === 'POST') {
        const fullname = clean(body.fullname, MAX_NAME);
        const comment = clean(body.comment, MAX_TEXT);
        if (!fullname) {
          return json({ success: false, error: 'Vui lòng nhập tên' }, 400, origin);
        }
        if (!comment) {
          return json({ success: false, error: 'Vui lòng nhập lời chúc' }, 400, origin);
        }

        const createdAt = new Date().toISOString();
        await env.DB.prepare(
          'INSERT INTO wishes (slug, fullname, comment, approved, created_at) ' +
            'VALUES (?1, ?2, ?3, 1, ?4)'
        )
          .bind(slug, fullname, comment, createdAt)
          .run();

        return json(
          { success: true, data: { fullname, comment, createdAt } },
          200,
          origin
        );
      }

      // ----- Xác nhận tham dự -----
      if (kind === 'rsvp' && request.method === 'POST') {
        const guestName = clean(body.guestName, MAX_NAME);
        if (!guestName) {
          return json({ success: false, error: 'Vui lòng nhập họ tên' }, 400, origin);
        }

        let num = parseInt(body.numberOfGuests, 10);
        if (!isFinite(num) || num < 1) num = 1;
        if (num > 50) num = 50;

        await env.DB.prepare(
          'INSERT INTO rsvp (slug, guest_name, will_attend, event_type, event_name, ' +
            'message, number_of_guests, payload, created_at) ' +
            'VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)'
        )
          .bind(
            slug,
            guestName,
            body.willAttend ? 1 : 0,
            clean(body.eventType, 60),
            clean(body.eventName, 120),
            clean(body.message, MAX_TEXT),
            num,
            JSON.stringify(body).slice(0, 4000),
            new Date().toISOString()
          )
          .run();

        return json({ success: true }, 200, origin);
      }

      return json({ success: false, error: 'Phương thức không hỗ trợ' }, 405, origin);
    } catch (e) {
      return json({ success: false, error: 'Lỗi máy chủ, vui lòng thử lại' }, 500, origin);
    }
  },
};

/** Chuyển tên tiếng Việt thành slug URL: "Sân nhà nhiều chó" -> "san-nha-nhieu-cho" */
export const slugify = (input: string): string =>
  input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // bỏ dấu tổ hợp
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Dùng để nhận biết link cũ dạng /tram-cuu-ho/<uuid> */
export const isUuid = (v: string): boolean => UUID_RE.test(v);

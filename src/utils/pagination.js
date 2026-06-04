function getPagination(query) {
  const page = Math.max(Number(query.page) || 1, 1);

  // Jika limit tidak dikirim → null (ambil semua produk)
  const limit =
    query.limit === undefined || query.limit === '' || query.limit === null
      ? null
      : Math.min(Math.max(Number(query.limit), 1), 100);

  const skip = (page - 1) * (limit ?? 0);

  return { page, limit, skip };
}

module.exports = getPagination;

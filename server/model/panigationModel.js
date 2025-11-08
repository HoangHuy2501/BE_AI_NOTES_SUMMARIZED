const db = require('../config/ConnectData');

module.exports = {
  getPanigation: async ({
    skip = 0,
    top = 10,
    filters = {},
    orderBy = 'created_at',
    order = 'ASC',
    dbmodel,   // ví dụ: "SELECT * FROM notes WHERE user_id = $1"
    userid,
    count      // ví dụ: "SELECT COUNT(*) AS total FROM notes WHERE user_id = $1"
  }) => {
    if (!userid) throw new Error("userId is required");

    const values = [userid]; // $1 = userid
    const filterClauses = [];

    // --- Filters ---
    if (filters.search) {
      values.push(`%${filters.search}%`);
      filterClauses.push(`(name ILIKE $${values.length} OR title ILIKE $${values.length})`);
    }

    if (filters.isActive !== undefined) {
      values.push(filters.isActive);
      filterClauses.push(`is_active = $${values.length}`);
    }

    if (filters.fromDate) {
      values.push(filters.fromDate);
      filterClauses.push(`created_at >= $${values.length}`);
    }

    if (filters.toDate) {
      values.push(filters.toDate);
      filterClauses.push(`created_at <= $${values.length}`);
    }

    // --- Build WHERE clause ---
    const hasWhere = dbmodel.toLowerCase().includes("where");
const whereClause = filterClauses.length
  ? `${hasWhere ? " AND " : " WHERE "} ${filterClauses.join(" AND ")}`
  : "";

    // --- Pagination ---
    values.push(skip, top); // OFFSET = $N-1, LIMIT = $N

    // --- Data query ---
    const dataQuery = `
      ${dbmodel}
      ${whereClause}
      ORDER BY ${orderBy} ${order}
      OFFSET $${values.length - 1} LIMIT $${values.length}
    `;
    const dataResult = await db.query(dataQuery, values);
//     console.log("dataQuery:", dataQuery);
// console.log("values:", values);
// console.log("dataResult:", dataResult.rows);

    // --- Count query ---
    const countQuery = `
      ${count}
      ${whereClause}
    `;
    const countResult = await db.query(countQuery, values.slice(0, values.length - 2));
// console.log("countQuery:", countQuery);
// console.log("countResult:", countResult.rows[0].total);
    return {
      data: dataResult.rows || [],
      total: parseInt(countResult.rows[0]?.total || 0),
    };
  }
};

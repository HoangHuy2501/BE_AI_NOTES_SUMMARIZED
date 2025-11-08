const Panigation = require("../model/panigationModel");

const getPanigation = async (queryParams, dbmodel, userid, count) => {
  // --- Bắt buộc page và size ---
  const page = parseInt(queryParams.page) || 1;
  const size = parseInt(queryParams.size) || 10;
  const skip = (page - 1) * size;
  const top = size;

  // --- Filters không bắt buộc ---
  const filters = {};
  if (queryParams.SearchText) filters.search = queryParams.SearchText;
  if (queryParams.isActive !== undefined) filters.isActive = queryParams.isActive === "true";
  if (queryParams.fromDate) filters.fromDate = queryParams.fromDate;
  if (queryParams.toDate) filters.toDate = queryParams.toDate;

  // --- Order không bắt buộc ---
  const orderBy = queryParams.OrderBy || "created_at";
  const order = parseInt(queryParams.OrderType) === 1 ? "DESC" : "ASC";

  const result = await Panigation.getPanigation({
    skip,
    top,
    filters,
    orderBy,
    order,
    dbmodel,
    userid,
    count
  });

  return result;
};

module.exports = { getPanigation };

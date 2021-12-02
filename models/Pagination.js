const Pagination = function (data) {
  const startIndex = (data.page - 1) * data.limit;
  const endIndex = data.page * data.limit;

  const result = {};

  if (endIndex < data.results.length) {
    result.next = {
      page: data.page + 1,
      limit: data.limit,
    };
  }

  if (startIndex > 0) {
    result.previous = {
      page: data.page - 1,
      limit: data.limit,
    };
  }

  result.data = data.results.slice(startIndex, endIndex);
  return result;
};

module.exports = Pagination;

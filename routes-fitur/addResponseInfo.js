const addResponseInfo = (req, res, next) => {
  const originalJson = res.json;

  res.json = function (data) {
    if (req.isFromRouteFitur) {
      if (data && typeof data === 'object') {
        // Periksa apakah ada properti error, jika ada, set status ke false
        const isError = data.error !== undefined;

        data = {
          status: isError ? false : (data.status === undefined ? true : data.status),
          author: 'parhan',
          ...data,
        };
      }
    }
    originalJson.call(this, data);
  };

  next();
};

export default addResponseInfo;

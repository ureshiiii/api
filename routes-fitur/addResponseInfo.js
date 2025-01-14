const addResponseInfo = (req, res, next) => {
  const originalJson = res.json;

  res.json = function (data) {
    if (req.isFromRouteFitur) {
      if (data && typeof data === 'object') {
        data.status = data.status === undefined ? true : data.status;
        data.author = 'parhan';
      }
    }
    originalJson.call(this, data);
  };

  next();
};

export default addResponseInfo;

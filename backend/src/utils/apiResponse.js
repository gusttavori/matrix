/**
 * Resposta de sucesso padronizada
 */
function successResponse(res, data = null, message = 'Operação realizada com sucesso.', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
}

/**
 * Resposta de erro padronizada
 */
function errorResponse(res, message = 'Não foi possível realizar a operação.', statusCode = 400, error = null) {
  const response = {
    success: false,
    message
  };

  if (error && process.env.NODE_ENV === 'development') {
    response.error = error;
  }

  return res.status(statusCode).json(response);
}

module.exports = { successResponse, errorResponse };

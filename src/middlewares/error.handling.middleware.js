/**
 * 에러 처리 미들웨어
 */
export default (err, req, res, next) => {
  // 에러 로깅
  console.error(err.stack);

  res.status(500).json({ message: '서버 내부에서 에러가 발생했습니다.' });
};

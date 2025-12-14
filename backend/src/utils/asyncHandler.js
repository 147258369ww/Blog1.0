/**
 * 异步处理器包装函数
 * 自动捕获异步函数中的错误并传递给错误处理中间件
 * 
 * @param {Function} fn - 异步控制器函数
 * @returns {Function} Express 中间件函数
 * 
 * @example
 * // 使用前
 * async getPost(req, res, next) {
 *   try {
 *     const post = await postService.getPost(req.params.id);
 *     res.json({ success: true, data: post });
 *   } catch (error) {
 *     next(error);
 *   }
 * }
 * 
 * // 使用后
 * getPost: asyncHandler(async (req, res) => {
 *   const post = await postService.getPost(req.params.id);
 *   res.json({ success: true, data: post });
 * })
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;

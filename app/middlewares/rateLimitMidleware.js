
const rateLimit = require("express-rate-limit")

const limiter = rateLimit({
  // 15 minutes
  windowMs: 15 * 60 * 1000,
  // gioi han 1 dia chi ip request toi da 200 lan/15 phut
  max: 200
})


module.exports = {
  limiter
}
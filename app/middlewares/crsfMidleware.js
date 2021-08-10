
/**
 * CSRF ( Cross Site Request Forgery) là kỹ thuật tấn công bằng cách sử 
 * dụng quyền chứng thực của người dùng đối với một website
 * . CSRF là kỹ thuật tấn công vào người dùng, dựa vào đó hacker có 
 * thể thực thi những thao tác phải yêu cầu sự chứng thực
 */
const csrfProtection = (req, res, next) => {
  res.cookie('csrftoken', req.csrfToken())
  res.locals.csrftoken = req.csrfToken()
  next();
}


module.exports = {
  csrfProtection
}

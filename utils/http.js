const axios = require('axios')

exports.get = ({
  url
}) => {
  return axios({
    url
  })
  .then((result) => {
    return result.data
  })
}
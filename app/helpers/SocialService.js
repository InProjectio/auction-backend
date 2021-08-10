// const request = require('request-promise')
const axios = require('axios')
var _ = require('lodash')

const getSocialFacebook = async (socialToken) => {
  try {
    let fb = await axios.get('https://graph.facebook.com/v2.8/me', {
      params: {
        access_token: socialToken,
        fields: 'id,email,birthday,location,locale,age_range,currency,first_name,last_name,name_format,gender'
      }
    })
    if (fb && fb.data && fb.data.id) {
      return {
        socialToken: socialToken,
        socialType: 'FACEBOOK',
        socialUserId: fb.data.id,
        fullName: fb.data.name ? fb.data.name : (fb.data.first_name && fb.data.last_name && `${fb.data.last_name} ${fb.data.first_name}`),
        email: fb.data.email,
      }
    }
    return {}
  } catch (error) {
    console.log(error)
    return {}
  }
}

const getSocialGoogle = async (socialToken) => {
  try {
    let gg = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${socialToken}`
      }
    })
    if (gg && gg.data && gg.data.id) {
      return {
        socialToken: socialToken,
        socialType: 'GOOGLE',
        socialUserId: gg.data.id,
        fullName: gg.data.name ? gg.data.name : (gg.data.first_name && gg.data.last_name && `${gg.data.last_name} ${gg.data.first_name}`),
        email: gg.data.email
      }
    }
    return {}
  } catch (error) {
    console.log(error)
    return {}
  }

}

const getSociaLinkedIn = async (socialToken) => {
  let result = await axios.get('https://api.linkedin.com/v1/people', {
    headers: {
      'Authorization': `Bearer ${socialToken}`
    }
  })
  if (result && result.data && result.data.id) {
    return {
      socialToken: socialToken,
      socialType: 'GOOGLE',
      socialUserId: result.id,
      name: result.name,
      email: result.email
    }
  }
  return {}
}

const validateSocialAccount = async (input) => {

  let { socialToken, socialUserId, socialType } = input

  let isValidSocial = false
  let result = {}
  if (socialType) {
    switch (socialType) {
      case 'FACEBOOK':
        const facebook = await getSocialFacebook(socialToken)
        isValidSocial = facebook && facebook.socialUserId !== '' && facebook.socialUserId === socialUserId
        result = { ...facebook }
        break
      case 'GOOGLE':
        const google = await getSocialGoogle(socialToken)
        isValidSocial = google && google.socialUserId !== '' && google.socialUserId === socialUserId
        result = { ...google }
        break
      case 'LINKIN':
        const linkedin = await getSociaLinkedIn(socialToken)
        isValidSocial = linkedin && linkedin.socialUserId !== '' && linkedin.socialUserId === socialUserId
        result = { ...linkedin }
        break
      default:
        isValidSocial = false
        break
    }
  }
  result.isValidSocial = isValidSocial
  return result
}


module.exports = {
  getSocialFacebook,
  getSocialGoogle,
  getSociaLinkedIn,
  validateSocialAccount,
}
import decode from 'jwt-decode'

export default class AuthService {
  constructor(domain) {
    this.domain = domain || 'http://localhost:5000' // API server domain
  }

  signup = (email, password, name) => {
    // Get a token from api server using the fetch api
    return this.fetch(`${this.domain}/signup`, {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        name
      })
    }).then(res => {
      this.setToken(res.token) // Setting the token in localStorage
      return Promise.resolve(res)
    })
  }

  login = (email, password) => {
    // Get a token from api server using the fetch api
    return this.fetch(`${this.domain}/signin`, {
      method: 'POST',
      body: JSON.stringify({
        email,
        password
      })
    }).then(res => {
      this.setToken(res.token) // Setting the token in localStorage
      return Promise.resolve(res)
    })
  }

  loggedIn = () => {
    // Checks if there is a saved token and it's still valid
    const token = this.getToken() // GEtting token from localstorage
    return !!token && !this.isTokenExpired(token) // handwaiving here
  }

  isTokenExpired = token => {
    try {
      const decoded = decode(token)
      if (decoded.exp < Date.now() / 1000) {
        // Checking if token is expired. N
        return true
      }
      return false
    } catch (err) {
      return false
    }
  }

  setToken = idToken => {
    // Saves user token to localStorage
    localStorage.setItem('token', idToken)
  }

  getToken = () => {
    // Retrieves the user token from localStorage
    return localStorage.getItem('token')
  }

  logout = () => {
    // Clear user token and profile data from localStorage
    localStorage.removeItem('token')
  }

  getProfile = () => {
    // Using jwt-decode npm package to decode the token
    return decode(this.getToken())
  }

  fetch = (url, options) => {
    // performs api calls sending the required authentication headers
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }

    // Setting Authorization header
    // Authorization: Bearer xxxxxxx.xxxxxxxx.xxxxxx
    if (this.loggedIn()) {
      headers.Authorization = `Bearer ${this.getToken()}`
    }

    return (
      fetch(url, {
        headers,
        ...options
      })
        // eslint-disable-next-line no-underscore-dangle
        .then(this._checkStatus)
        .then(response => response.json())
    )
  }

  _checkStatus = response => {
    // raises an error in case response status is not a success
    if (response.status >= 200 && response.status < 300) {
      // Success status lies between 200 to 300
      return response
    }
    const error = new Error(response.statusText)
    error.response = response
    throw error
  }
}

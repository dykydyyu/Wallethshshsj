const adminCredentials = {
  username: 'Admin',
  password: '0963954664655'
};

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { username, password } = JSON.parse(event.body);

    if (username === adminCredentials.username && password === adminCredentials.password) {
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, isAdmin: true })
      };
    }

    return {
      statusCode: 401,
      body: JSON.stringify({ success: false, message: 'Invalid credentials' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

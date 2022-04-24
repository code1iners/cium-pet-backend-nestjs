export const LOGIN_QUERY = `mutation login($email: String!, $password: String!){ login(email: $email, password: $password) {ok token error {code message}}}`;
export const ME_QUERY = `query me{me{id email username}}`;

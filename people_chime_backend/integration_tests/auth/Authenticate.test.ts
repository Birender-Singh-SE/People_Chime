import { AuthenticationService } from './AuthenticationService'

async function testAuth() {
    const service = new AuthenticationService();
    const loginResult = await service.login(
        'people-chime-user-1',
        'People@12345'
    )
    console.log(loginResult.getSignInUserSession().getIdToken().getJwtToken());
}


testAuth();
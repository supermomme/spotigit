// For more information about this file see https://dove.feathersjs.com/guides/cli/authentication.html
import { AuthenticationParams, AuthenticationRequest, AuthenticationService, JWTStrategy } from '@feathersjs/authentication'

import { oauth, OAuthProfile, OAuthStrategy } from '@feathersjs/authentication-oauth'
import { Params, Query } from '@feathersjs/feathers'
import { URLSearchParams } from "url"

import type { Application } from './declarations'
import { NotAuthenticated } from '@feathersjs/errors/lib'
import jsonwebtoken, { JwtPayload } from 'jsonwebtoken'

declare module './declarations' {
  interface ServiceTypes {
    authentication: AuthenticationService
  }
}

class SpotifyStrategy extends OAuthStrategy {
  async getProfile(data: AuthenticationRequest, _params: Params<Query>): Promise<any> {
    if (data.access_token && data.profile) {
      return {
        id: data.profile.id,
        spotifyProfile: data.profile,
        authInfo: data.raw
      }
    }

    const responseAuth = await fetch('https://accounts.spotify.com/api/token?' + new URLSearchParams({
      grant_type: 'authorization_code',
      code: data.code,
      redirect_uri: 'http://localhost:3030/oauth/spotify/callback'
    }).toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic ' + Buffer.from(this.configuration.key + ':' + this.configuration.secret).toString('base64')
      }
    })
    const authInfo = await responseAuth.json()
    
    const responseUser = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authInfo.access_token}`
      }
    })
    const user = await responseUser.json()

    return {
      id: user.id,
      spotifyProfile: user,
      authInfo
    }
  }

  async getEntityData(profile: OAuthProfile, _existingEntity: any, _params: Params) {
    return {
      spotifyId: profile.id,
      spotify_country: profile.spotifyProfile.country,
      spotify_display_name: profile.spotifyProfile.display_name,
      spotify_email: profile.spotifyProfile.email,
      spotify_explicit_content_filter_enabled: profile.spotifyProfile.explicit_content?.filter_enabled,
      spotify_explicit_content_filter_locked: profile.spotifyProfile.explicit_content?.filter_locked,
      spotify_external_urls_spotify: profile.spotifyProfile.external_urls.spotify,
      spotify_followers_href: profile.spotifyProfile.followers.href,
      spotify_followers_total: profile.spotifyProfile.followers.total,
      spotify_href: profile.spotifyProfile.href,
      spotify_images: profile.spotifyProfile.images,
      spotify_product: profile.spotifyProfile.product,
      spotify_type: profile.spotifyProfile.type,
      spotify_uri: profile.spotifyProfile.uri,
      spotify_access_token: profile.authInfo.access_token,
      spotify_refresh_token: profile.authInfo.refresh_token,
    }
  }
}

class BetterJWTStrategy extends JWTStrategy {
  async authenticate(authentication: AuthenticationRequest, params: AuthenticationParams) {
    const { accessToken } = authentication;
    if (!accessToken) throw new NotAuthenticated('No access token')

    const payload = jsonwebtoken.decode(accessToken) as JwtPayload|null
    if (payload?.worker) {
      return {
        accessToken,
        authentication: {
          strategy: 'jwt',
          accessToken,
          payload
        }
      };
    }
    return super.authenticate(authentication, params)
  }
}


export const authentication = (app: Application) => {
  const authentication = new AuthenticationService(app)

  authentication.register('jwt', new BetterJWTStrategy())
  authentication.register('spotify', new SpotifyStrategy())

  app.use('authentication', authentication)
  app.configure(oauth())
}

// For more information about this file see https://dove.feathersjs.com/guides/cli/authentication.html
import { AuthenticationParams, AuthenticationRequest, AuthenticationService, JWTStrategy } from '@feathersjs/authentication'

import { oauth, OAuthProfile, OAuthStrategy } from '@feathersjs/authentication-oauth'
import { Params, Query } from '@feathersjs/feathers'
import { URLSearchParams } from "url"

import type { Application } from './declarations'
import axios from 'axios';

declare module './declarations' {
  interface ServiceTypes {
    authentication: AuthenticationService
  }
}

class SpotifyStrategy extends OAuthStrategy {
  async getProfile(data: AuthenticationRequest, _params: Params<Query>): Promise<any> {
    console.log({data});

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
    
    console.log({authInfo})
    
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
    console.log(profile);
    


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

      // spotifyProfile: profile.spotifyProfile,
      // authInfo: profile.authInfo
    }
  }

  async authenticate(authentication: AuthenticationRequest, originalParams: AuthenticationParams): Promise<{ [x: string]: any; authentication: { strategy: string; }; }> {
    const entity: string = this.configuration.entity
    const { provider, ...params } = originalParams
    const profile = await this.getProfile(authentication, params)
    const existingEntity = (await this.findEntity(profile, params)) || (await this.getCurrentEntity(params))

    console.log('authenticate with (existing) entity', existingEntity)

    const authEntity = !existingEntity
      ? await this.createEntity(profile, params)
      : await this.updateEntity(existingEntity, profile, params)

    return {
      authentication: { strategy: 'spotify' },
      [entity]: await this.getEntity(authEntity, originalParams)
    }
  }

}


export const authentication = (app: Application) => {
  const authentication = new AuthenticationService(app)

  authentication.register('jwt', new JWTStrategy())
  authentication.register('spotify', new SpotifyStrategy())

  app.use('authentication', authentication)
  app.configure(oauth())
}

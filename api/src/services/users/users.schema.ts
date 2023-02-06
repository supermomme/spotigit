// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'

// Main data model schema
export const userSchema = Type.Object(
  {
    id: Type.Number(),
    spotifyId: Type.Optional(Type.String()),
    spotify_country: Type.Optional(Type.String()),
    spotify_display_name: Type.Optional(Type.String()),
    spotify_email: Type.Optional(Type.String()),
    spotify_explicit_content_filter_enabled: Type.Optional(Type.String()),
    spotify_explicit_content_filter_locked: Type.Optional(Type.String()),
    spotify_external_urls_spotify: Type.Optional(Type.String()),
    spotify_followers_href: Type.Union([Type.Null(), Type.String()]),
    spotify_followers_total: Type.Optional(Type.Number()),
    spotify_href: Type.Optional(Type.String()),
    spotify_images: Type.Optional(Type.Array(Type.Object({
      url: Type.String(),
      width: Type.Number(),
      height: Type.Number(),
    }))),
    spotify_product: Type.Optional(Type.String()),
    spotify_type: Type.Optional(Type.String()),
    spotify_uri: Type.Optional(Type.String()),
    spotify_access_token: Type.Optional(Type.String()),
    spotify_refresh_token: Type.Optional(Type.String()),
    createdAt: Type.Number(),
  },
  { $id: 'User', additionalProperties: false }
)
export type User = Static<typeof userSchema>
export const userValidator = getValidator(userSchema, dataValidator)
export const userResolver = resolve<User, HookContext>({})

export const userExternalResolver = resolve<User, HookContext>({})

// Schema for creating new users
export const userDataSchema = Type.Pick(
  userSchema,
  [
    'spotifyId',
    'spotify_country',
    'spotify_display_name',
    'spotify_email',
    'spotify_explicit_content_filter_enabled',
    'spotify_explicit_content_filter_locked',
    'spotify_external_urls_spotify',
    'spotify_followers_href',
    'spotify_followers_total',
    'spotify_href',
    'spotify_images',
    'spotify_product',
    'spotify_type',
    'spotify_uri',
    'spotify_access_token',
    'spotify_refresh_token',
  ],
  {
    $id: 'UserData',
    additionalProperties: false
  } 
)
export type UserData = Static<typeof userDataSchema>
export const userDataValidator = getValidator(userDataSchema, dataValidator)
export const userDataResolver = resolve<User, HookContext>({
  createdAt: async () => {
    return Date.now()
  }
})

// Schema for updating existing users
export const userPatchSchema = Type.Partial(userSchema, {
  $id: 'UserPatch'
})
export type UserPatch = Static<typeof userPatchSchema>
export const userPatchValidator = getValidator(userPatchSchema, dataValidator)
export const userPatchResolver = resolve<User, HookContext>({})

// Schema for allowed query properties
export const userQueryProperties = Type.Pick(userSchema, ['id', 'spotifyId', 'createdAt'])
export const userQuerySchema = Type.Intersect(
  [
    querySyntax(userQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type UserQuery = Static<typeof userQuerySchema>
export const userQueryValidator = getValidator(userQuerySchema, queryValidator)
export const userQueryResolver = resolve<UserQuery, HookContext>({
  // If there is a user (e.g. with authentication), they are only allowed to see their own data
  id: async (value, user, context) => {
    if (context.params.user) {
      return context.params.user.id
    }

    return value
  }
})
